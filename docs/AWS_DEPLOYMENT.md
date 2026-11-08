# AWS deployment

> Starting out? The single-server setup in [AWS_EC2_DEPLOYMENT.md](AWS_EC2_DEPLOYMENT.md) is simpler and
> cheaper. This document describes the larger managed architecture.

## Target architecture

```
                         Route 53 (hikeup domain)
                                 │
                 ┌───────────────┴────────────────┐
         www / apex                         media.<domain>
                 │                                 │
        CloudFront (ACM TLS, WAF)        CloudFront (ACM TLS, OAC)
                 │                                 │
   Application Load Balancer (HTTPS)       S3 uploads bucket (private,
        │                    │              versioned, public/* only)
   ECS Fargate: web    ECS Fargate: api ──▶ Amazon SES (email)
   (Next.js :3000) ──▶ (NestJS :4000)  ──▶ S3 (PutObject / presigned GetObject)
                             │
                   RDS PostgreSQL 16 (private subnets, Multi-AZ)
                   Secrets Manager (DATABASE_URL, JWT secrets)
                   CloudWatch Logs (JSON logs)
```

- Region suggestion: **me-central-1 (UAE)** for data residency and latency; check that every
  service you need (e.g. SES) is available there, otherwise use `eu-central-1`/`eu-west-1` for SES.
- The website talks to the API internally (`API_INTERNAL_URL`, e.g. ECS Service Connect
  `http://api.hikeup.internal:4000`). Browser calls go to `https://<domain>/api/v1/*`, proxied by
  Next.js, so the API does not need a public listener (expose `api.<domain>` only if third parties
  need the API or you want Swagger behind authentication).

## 1. Prerequisites

1. Domain in Route 53 (or delegate NS records).
2. ACM certificates: one in the ALB region, one in **us-east-1** for CloudFront.
3. ECR repositories `hikeup-api` and `hikeup-web`.
4. VPC with 2+ public subnets (ALB) and 2+ private subnets (ECS, RDS) + NAT gateway (or VPC endpoints
   for ECR, S3, Secrets Manager, CloudWatch Logs, SES).

## 2. Database — RDS PostgreSQL

- Engine PostgreSQL 16, `db.t4g.small`+ , Multi-AZ for production, storage encryption (KMS),
  **not publicly accessible**, security group allowing 5432 only from the API tasks' security group.
- Automated backups 7–35 days, PITR on, deletion protection on, Performance Insights optional.
- Create the database and an application user; put the connection string in Secrets Manager
  (`hikeup/production` → `DATABASE_URL`, append `?sslmode=require`).

## 3. Secrets — AWS Secrets Manager

Create secret `hikeup/production` (JSON):

```json
{ "DATABASE_URL": "postgresql://…?sslmode=require",
  "JWT_SECRET": "<openssl rand -base64 48>",
  "JWT_REFRESH_SECRET": "<openssl rand -base64 48>",
  "MAIL_TO": "operations@<domain>" }
```

Never commit `.env`, AWS keys, database passwords or JWT secrets. Rotate JWT secrets by deploying
new values (all sessions are signed out).

## 4. File storage — S3 + CloudFront

1. Bucket `<UPLOADS_BUCKET>`: Block Public Access **on**, versioning **on**, default encryption,
   lifecycle `infra/aws/s3-uploads-lifecycle.json`.
2. CloudFront distribution `media.<domain>` with Origin Access Control → bucket; apply
   `infra/aws/s3-uploads-bucket-policy.json` (CloudFront may read only `public/*`; customer photos in
   `private/*` are served through the API with presigned URLs).
3. API env: `STORAGE_DRIVER=s3`, `AWS_S3_BUCKET`, `AWS_REGION`, `STORAGE_PUBLIC_BASE_URL=https://media.<domain>`.
   Credentials come from the task role (`infra/aws/iam-api-task-role-policy.json`) — leave
   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` empty.
4. Web build arg `STORAGE_PUBLIC_BASE_URL=https://media.<domain>` (adds the host to `next/image`).

## 5. Email — Amazon SES

1. Verify the domain identity (DKIM CNAMEs in Route 53), add SPF/DMARC records.
2. Request production access (leave the sandbox).
3. API env: `MAIL_TRANSPORT=ses`, `AWS_SES_REGION`, `MAIL_FROM=HIKE UP General Maintenance <no-reply@<domain>>`.
4. Set the notification recipient in Admin → Site Settings (or `MAIL_TO`).

(SMTP providers also work: `MAIL_TRANSPORT=smtp` + `SMTP_*`.)

## 6. Containers — ECR + ECS Fargate

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
docker build -f docker/api/Dockerfile -t <registry>/hikeup-api:<tag> . && docker push <registry>/hikeup-api:<tag>
docker build -f docker/web/Dockerfile \
  --build-arg API_INTERNAL_URL=http://api.hikeup.internal:4000 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://<domain> \
  --build-arg STORAGE_PUBLIC_BASE_URL=https://media.<domain> \
  -t <registry>/hikeup-web:<tag> . && docker push <registry>/hikeup-web:<tag>
```

- Task definitions: `infra/aws/ecs-task-definition-api.json`, `infra/aws/ecs-task-definition-web.json`.
- Execution role: `infra/aws/iam-execution-role-policy.json`; API task role: `iam-api-task-role-policy.json`.
- Services: `hikeup-web` (behind the ALB, path `/*`), `hikeup-api` (Service Connect name `api`;
  optional ALB rule for `api.<domain>`), min 2 tasks each across AZs, deployment circuit breaker on.
- ALB target health checks: web `GET /robots.txt`, api `GET /api/v1/health`.
- API env: `NODE_ENV=production`, `COOKIE_SECURE=true`, `TRUST_PROXY=2` (CloudFront + ALB),
  `WEB_URL=https://<domain>`, `LOG_FORMAT=json`, `SWAGGER_ENABLED=false`, `RUN_MIGRATIONS=false`
  (migrations run as a one-off task, see below).

## 7. CloudFront for the website

- Origin: the ALB (HTTPS only, custom header secret to block direct ALB access).
- Behaviours: `/_next/static/*` and `/brand/*`, `/images/*` cached (immutable); default behaviour
  forwards all cookies, query strings and the `Host` header with caching disabled (Next.js sets
  its own ISR headers) — or use the `CachingDisabled` + `AllViewerExceptHostHeader` policies.
- Attach AWS WAF (managed common rule set + rate-based rule).
- Route 53 alias records: apex/www → website distribution, `media` → media distribution.

## 8. Migrations & seed per release

1. Build & push images.
2. Run a one-off ECS task with the new API image: `sh -c "cd /app/database && npx prisma migrate deploy"`.
3. First deployment only: run the seed once (`RUN_SEED=true` or
   `sh -c "cd /app/database && npx tsx seed/seed.ts"`) with `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`
   passed as task overrides, then sign in and change the password.
4. Update the ECS services (rolling deployment).

`.github/workflows/deploy-aws.yml` automates this with GitHub OIDC (`infra/aws/github-oidc-trust-policy.json`).

## 9. Security checklist

- IAM least privilege (task role only S3 prefixes + SES identity); no static keys in containers.
- RDS and API in private subnets; security groups: ALB → web/api, api → RDS only.
- HTTPS everywhere (ACM), HSTS (set by the web app in production), TLS 1.2+ on CloudFront.
- S3 Block Public Access on, bucket policy limited to CloudFront OAC and `public/*`.
- Secrets in Secrets Manager; enable rotation for the database password.
- CloudWatch alarms: 5xx rate, unhealthy targets, RDS CPU/storage/connections.

## 10. Backups & disaster recovery

| Asset | Protection | Restore |
| --- | --- | --- |
| RDS | Automated backups + PITR, manual snapshots before releases, cross-region snapshot copy | Restore to a new instance → update `DATABASE_URL` secret → redeploy |
| S3 uploads | Versioning + lifecycle, optional cross-region replication | Restore previous object versions (console / `aws s3api get-object --version-id`) |
| Code & images | Git + immutable ECR tags (commit SHA) | Redeploy the previous task definition revision |
| Configuration | Secrets Manager versions, Site Settings in the database | Restore secret version / database |

Test a restore at least quarterly.

## 11. Alternative: single EC2 host

For a smaller budget, one EC2 instance (t3.small+) can run `docker compose` (web + api) behind an
ALB or Caddy/Nginx with Let's Encrypt, still using RDS, S3 and SES. Keep the same environment
variables and run `docker compose exec api sh -c "cd /app/database && npx prisma migrate deploy"`
on each release.
