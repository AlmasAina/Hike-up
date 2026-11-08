# AWS deployment — single EC2 server (recommended start)

One EC2 instance runs everything with Docker: PostgreSQL, the API, the website and Caddy (automatic
HTTPS). It is the simplest and cheapest way to run HIKE UP on AWS. When traffic grows, move to the
managed architecture in [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md).

Files used: `docker-compose.prod.yml`, `deploy/Caddyfile`, `deploy/production.env.example`,
`deploy/setup-server.sh`.

## 1. AWS account

1. Create the account at <https://aws.amazon.com> **in the company's name, with the company card**.
2. Turn on MFA for the root user (Account → Security credentials).
3. Billing → Budgets → create a monthly budget alert (e.g. USD 50) so there are no surprises.
4. Top-right region selector: choose **Middle East (UAE) me-central-1**.

## 2. Launch the server (EC2)

EC2 → Instances → **Launch instance**:

| Setting | Value |
|---|---|
| Name | `hikeup-web` |
| AMI | **Ubuntu Server 24.04 LTS** |
| Instance type | **t3.small** (2 vCPU, 2 GB) to start — `deploy/setup-server.sh` adds swap so builds succeed; move to **t3.medium** (4 GB) if the site gets busy. |
| Key pair | Create new → `hikeup-key` → download and keep safe |
| Network → Security group | Allow **SSH**, **HTTP** and **HTTPS** from *Anywhere*. (Browser-based EC2 Instance Connect comes from AWS addresses, so restricting SSH to *My IP* blocks it; logins still need the key.) |
| Storage | **30 GB gp3** |

Then EC2 → **Elastic IPs** → *Allocate* → *Associate* with `hikeup-web`. This fixed IP is what the
domain points to.

## 3. Domain

- **.com**: Route 53 → *Registered domains* → *Register domain*, or any registrar.
- **.ae**: requires the UAE trade licence; buy from a UAE registrar (e.g. AEserver).

DNS records (in Route 53 *Hosted zone*, or at the registrar):

| Type | Name | Value |
|---|---|---|
| A | `@` (root) | Elastic IP |
| A | `www` | Elastic IP |

Wait until `https://dnschecker.org` shows the Elastic IP for the domain before step 6.

## 4. Connect to the server

EC2 → Instances → select `hikeup-web` → **Connect** → *EC2 Instance Connect* → **Connect**.
A terminal opens in the browser; all commands below are pasted there.

## 5. Get the code and prepare the server

The repository is private, so create a read-only token first: GitHub → Settings → Developer settings →
*Fine-grained tokens* → Generate → repository access: this repository only → *Contents: Read-only*.

```bash
git clone -b claude/hike-up-maintenance-platform-yej4n8 https://github.com/almasaina/hike-up.git
# Username: your GitHub username — Password: paste the token
cd hike-up
sudo bash deploy/setup-server.sh
exit
```

Reconnect (step 4), then `cd hike-up`.

## 6. Settings

```bash
cp deploy/production.env.example .env
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"
nano .env
```

Fill in `DOMAIN` (e.g. `hikeup.ae`, no `https://`, no `www`), the three generated values, the Gmail
App Password (`SMTP_PASSWORD`) and the admin email (`SEED_ADMIN_EMAIL`). Save with **Ctrl+O, Enter**,
exit with **Ctrl+X**.

## 7. Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The first build takes 10–20 minutes. Check that all four services are running/healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

Create the first admin account and the starting content (run once):

```bash
docker compose -f docker-compose.prod.yml exec api sh -c "cd /app/database && npx tsx seed/seed.ts"
```

If `SEED_ADMIN_PASSWORD` was empty, the generated password is printed here — store it safely.

Open `https://<your-domain>` and `https://<your-domain>/admin/login`. Pages built before the API was
running fill in automatically within a minute.

## Everyday operations

| Task | Command (inside `~/hike-up`) |
|---|---|
| Deploy an update | `git pull && docker compose -f docker-compose.prod.yml up -d --build` |
| Status | `docker compose -f docker-compose.prod.yml ps` |
| Logs | `docker compose -f docker-compose.prod.yml logs -f --tail 100 api` (or `web`, `caddy`) |
| Restart | `docker compose -f docker-compose.prod.yml restart` |
| Database backup | `docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U hikeup hikeup \| gzip > backup-$(date +%F).sql.gz` |

Database migrations run automatically when the API starts.

**Backups:** also enable EC2 → Elastic Block Store → *Lifecycle Manager* → a daily snapshot policy for
the server's volume (keeps the database and uploaded images).

## Troubleshooting

- **No HTTPS / certificate errors:** DNS must point to the Elastic IP and ports 80/443 must be open in
  the security group. See `docker compose -f docker-compose.prod.yml logs caddy`.
- **Build stops with "Killed":** not enough memory; `deploy/setup-server.sh` adds swap, or use t3.medium.
- **Emails not sent:** check `SMTP_*` in `.env`, then
  `docker compose -f docker-compose.prod.yml up -d api` to apply changes.
