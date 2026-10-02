# Security

## Controls implemented

| Area | Implementation |
| --- | --- |
| Passwords | Argon2id (19 MiB, t=2). Plain passwords are never stored or logged; admins can only send reset links. Policy: 8–128 chars with a letter and a number. |
| Sessions | 15-minute JWT access tokens (HS256, issuer/audience checked) + 30-day opaque refresh tokens stored as HMAC-SHA256 hashes; rotation on every refresh; reuse of an old token revokes the whole family; logout, password change/reset and account disable revoke sessions. |
| Cookies | `HttpOnly`, `SameSite=Lax`, `Secure` (enforced in production), optional `Domain`. |
| CSRF | SameSite cookies + API middleware rejecting cookie-bearing state-changing requests from non-allowed `Origin`s; the browser only calls the same-origin proxy. |
| Authorisation | Global JWT guard (user re-loaded each request, disabled users blocked) + `RolesGuard`; STAFF limited to assigned requests in the service layer; customers can only reach their own records (others return 404). |
| Input validation | class-validator DTOs with `whitelist` + `forbidNonWhitelisted`; Zod on the frontend; enum/UUID/phone/email/URL/hex validation. |
| SQL injection | Prisma parameterised queries; raw SQL only via tagged `$queryRaw` templates. |
| XSS | React escaping; rich text sanitised server-side with an allow-list (`sanitize-html`); plain-text fields stripped of markup; JSON-LD escaped; CSP headers on the website; `X-Content-Type-Options: nosniff`. |
| Uploads | JPEG/PNG/WEBP only, verified by magic bytes (not filename/MIME), 5 MB per file, max 6 per request, random UUID keys, no SVG/HTML/executables, private customer photos behind authorisation (presigned S3 URLs in production). |
| Headers | Helmet on the API; CSP, HSTS (production), `X-Frame-Options: DENY`, Referrer-Policy and Permissions-Policy on the website; `X-Powered-By` removed. |
| Rate limiting | Global 120 req/min/IP; stricter on auth, quote and contact endpoints; honeypot fields on public forms. |
| Enumeration | Generic login errors, constant-time-ish failed-login path, forgot-password always returns success. |
| Logging & audit | Request log (method, path, status, duration, IP; no bodies or query strings); `audit_logs` for sign-ins, failed logins, content changes, status changes, assignments, settings and user management (actor, IP, user agent, metadata) — visible to super admins. |
| Configuration | Environment validated at start-up; weak/missing secrets refuse to boot; `COOKIE_SECURE` required in production. |
| Errors | Central exception filter; no stack traces or SQL details returned to clients. |
| Robots | Admin/customer/auth pages `noindex` and disallowed in robots.txt. |

## Operational checklist

- [ ] Generate unique `JWT_SECRET` / `JWT_REFRESH_SECRET` per environment (≥ 48 random bytes).
- [ ] Store secrets in AWS Secrets Manager; never commit `.env` (it is git-ignored).
- [ ] Change the seeded admin password after first login; create named accounts per person.
- [ ] Keep `SEED_DEMO_USERS=false` and `SEED_PUBLISH_SAMPLE_CONTENT=false` in production.
- [ ] Disable or protect Swagger (`SWAGGER_ENABLED=false`).
- [ ] Set `TRUST_PROXY` to the number of proxies (CloudFront + ALB = 2) so rate limits use real IPs.
- [ ] Enable AWS WAF, RDS encryption, S3 Block Public Access, CloudTrail.
- [ ] Review audit logs regularly; set CloudWatch alarms on 401/403/429 spikes.
- [ ] Keep dependencies patched (`npm audit`, Dependabot).
- [ ] Have the legal pages reviewed by a qualified UAE adviser (they are templates, not legal advice).

## Reporting

Report suspected vulnerabilities privately to the site owner (email in Site Settings). Do not open
public issues for security problems.
