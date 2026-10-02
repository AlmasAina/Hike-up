# API reference

- Base URL: `http://localhost:4000/api/v1` (browser: `/api/v1` through the website proxy)
- Interactive documentation: **`/api/docs`** (Swagger UI) · JSON: `/api/docs-json`
  (disable in production with `SWAGGER_ENABLED=false` or protect it at the load balancer)

## Authentication

| Method | How |
| --- | --- |
| Browser | `POST /auth/login` sets HTTP-only cookies `hu_at` (access, 15 min) and `hu_rt` (refresh, 30 days). Requests send them automatically. |
| API clients | Use `accessToken` from the login response as `Authorization: Bearer <token>`; refresh with `POST /auth/refresh {"refreshToken": "…"}` when not using cookies. |

Refresh tokens rotate on every use. Presenting an already-used refresh token revokes the whole
session family (theft detection). State-changing requests that carry cookies must come from an
allowed origin (`WEB_URL`, `CORS_ORIGINS`).

## Errors

All errors share one shape:

```json
{ "statusCode": 400, "error": "BAD_REQUEST", "message": "Validation failed",
  "details": ["email must be an email"], "path": "/api/v1/auth/register", "timestamp": "…" }
```

`401` = not signed in / expired, `403` = role not allowed, `404` = not found (also used to hide
other customers' records), `409` = duplicate, `429` = rate limited.

## Rate limits

Default 120 requests/minute per IP (`THROTTLE_LIMIT`). Stricter: register/login/reset 10/min,
forgot-password 5/min, quote requests 5/min, contact 5/min.

## Endpoints

### Public

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness + database check |
| GET | `/settings` | Public company/contact/SEO settings |
| GET | `/services` · `/services/:slug` | Published services · detail with features, FAQs, gallery, related |
| GET | `/packages` | Active packages + comparison rows |
| GET | `/projects?service=&page=` · `/projects/:slug` | Published projects |
| GET | `/testimonials` | Published testimonials |
| GET | `/faqs?category=` | Published FAQs |
| GET | `/content?prefix=about.` | Page content sections |
| GET | `/legal/:slug` | Legal page |
| POST | `/quote-requests` | Submit a quote/service request (JSON or multipart with `images[]`) |
| POST | `/contact` | Contact form |

### Auth & account

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout` | Session lifecycle |
| GET | `/auth/me` | Current user |
| POST | `/auth/forgot-password` · `/auth/reset-password` | Password reset (no account enumeration) |
| POST | `/auth/verify-email` · `/auth/resend-verification` | Email verification |
| POST | `/auth/change-password` | Change password (signs out other sessions) |
| PATCH | `/account/profile` · POST `/account/avatar` | Own profile |
| GET | `/notifications` · PATCH `/notifications/:id/read` · POST `/notifications/read-all` | In-app notifications |

### Customer (`CUSTOMER`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/customer/dashboard` | Counters + recent requests |
| GET | `/customer/quote-requests` · `/customer/quote-requests/:id` | Own requests |
| POST | `/customer/quote-requests/:id/images` | Add photos |
| GET/POST | `/customer/quote-requests/:id/messages` | Conversation with the team |
| GET | `/customer/messages` | Conversation list |
| GET | `/files/quote-images/:id` | Private request photo (owner, admins, assigned staff) |

### Back office (`SUPER_ADMIN`, `ADMIN`; STAFF where noted)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | KPIs + chart series |
| GET | `/admin/quote-requests` (STAFF: assigned only) | Search, filter `status`, `serviceId`, `type`, `from`, `to`, `assignedToMe` |
| GET/PATCH | `/admin/quote-requests/:id` (STAFF if assigned) | Detail · change status (+ customer note) |
| POST | `/admin/quote-requests/:id/notes` · `/messages` (STAFF if assigned) | Internal note · reply to customer |
| POST/DELETE | `/admin/quote-requests/:id/assignments[/:technicianId]` | Assign / unassign technicians |
| DELETE | `/admin/quote-requests/:id` | Archive (soft delete) |
| CRUD | `/admin/services` (+ `PUT /admin/services/reorder`) | Services |
| CRUD | `/admin/packages` (+ reorder), `/admin/package-comparison-rows` (+ reorder) | Packages & comparison table |
| CRUD | `/admin/projects`, `/admin/testimonials`, `/admin/faqs` | Content |
| GET/PATCH | `/admin/content`, `/admin/content/:key` | About / homepage sections |
| GET/PATCH | `/admin/legal`, `/admin/legal/:id` | Legal pages |
| GET/PATCH | `/admin/settings` · POST `/admin/settings/logo` · `/admin/settings/favicon` | Site settings & branding |
| POST | `/admin/uploads/image?folder=` | Upload a public image (returns `{ key, url }`) |
| CRUD | `/admin/technicians` · PUT `/admin/technicians/:id/login` | Technicians & STAFF logins |
| GET | `/admin/customers` · `/admin/customers/:id` · PATCH `…/status` · POST `…/reset-password` | Customers |
| GET/PATCH/DELETE | `/admin/contact-messages[/:id]` | Contact messages |
| GET/POST/PATCH | `/admin/users[/:id]` (`SUPER_ADMIN`) | Back-office users & roles |
| GET | `/admin/audit-logs` (`SUPER_ADMIN`) | Audit trail |

### Example

```bash
curl -c jar -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"…"}' http://localhost:4000/api/v1/auth/login
curl -b jar 'http://localhost:4000/api/v1/admin/quote-requests?status=NEW'
curl -F firstName=Sara -F lastName=Ali -F email=sara@example.com -F phone=0501234567 \
  -F location='Khalifa City' -F propertyType=VILLA -F preferredContact=WHATSAPP \
  -F description='AC not cooling in the bedroom' -F images=@photo.jpg \
  http://localhost:4000/api/v1/quote-requests
```
