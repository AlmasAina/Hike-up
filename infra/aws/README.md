# AWS infrastructure templates

Reference templates for the production architecture described in
[`docs/AWS_DEPLOYMENT.md`](../../docs/AWS_DEPLOYMENT.md). Replace every `<PLACEHOLDER>` before use.

| File | Purpose |
| --- | --- |
| `ecs-task-definition-api.json` | Fargate task for the NestJS API (port 4000). Secrets come from Secrets Manager. |
| `ecs-task-definition-web.json` | Fargate task for the Next.js website (port 3000). |
| `iam-api-task-role-policy.json` | Least-privilege runtime permissions for the API (S3 uploads, SES email). |
| `iam-execution-role-policy.json` | Lets ECS pull images from ECR, read secrets and write logs. |
| `s3-uploads-bucket-policy.json` | Private bucket; CloudFront (OAC) may read only the `public/` prefix. |
| `s3-uploads-lifecycle.json` | Cleans up old object versions (versioning enabled for recovery). |
| `github-oidc-trust-policy.json` | Trust policy for the GitHub Actions deploy role (no long-lived keys). |

The CI/CD workflow that uses these is `.github/workflows/deploy-aws.yml`.
