# Application — Auto Repair Shop API

The main REST API for the auto repair shop management system, built with Fastify and deployed on Kubernetes (EKS).

## Technology Stack

- **Runtime**: Node.js 22
- **Language**: TypeScript ~5.9.2
- **Framework**: Fastify ~5.2.1
- **ORM**: Prisma 6.16.2
- **Database**: PostgreSQL 16
- **Architecture**: Clean Architecture
- **Observability**: OpenTelemetry
- **Testing**: Jest 30

## Architecture

```
src/
├── domain/           # Entities, enums, use-case interfaces
├── application/      # Use-case implementations, repository protocols
├── presentation/     # Controllers, middleware, HTTP helpers
├── infra/
│   ├── db/           # Prisma client, repositories, mappers
│   ├── cryptography/ # bcrypt, JWT adapters
│   ├── messaging/    # Nodemailer adapter
│   └── observability/# OpenTelemetry tracing, metrics, correlation
├── main/
│   ├── config/       # App config, Swagger docs
│   ├── routes/       # HTTP route definitions
│   ├── factories/    # Dependency injection (composition root)
│   ├── middlewares/   # Auth middleware
│   ├── plugins/      # Fastify plugins
│   └── adapters/     # Route-to-controller adapters
└── validation/       # Input validation
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Admin login (email/password) |
| POST | /api/auth/refresh | Public | Refresh JWT token |
| GET | /api/customers | JWT | List customers |
| POST | /api/customers | JWT | Create customer |
| GET | /api/vehicles | JWT | List vehicles |
| GET | /api/services | JWT | List services |
| GET | /api/parts-or-supplies | JWT | List parts/supplies |
| GET | /api/work-orders | JWT | List work orders |
| POST | /api/work-orders | JWT | Create work order |
| GET | /api/metrics | JWT | Service execution metrics |
| GET | /api/users | JWT | List users |
| GET | /health | Public | Health check |
| GET | /documentation | Public | Swagger UI |

## Local Development

```bash
# From repo root
yarn install

# Start PostgreSQL
docker compose up -d postgres

# Run migrations
cd application && npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
cd .. && npx nx serve auto-repair-shop
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `HOST` | Server bind address | `localhost` |
| `SERVER_PORT` | HTTP port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `OTEL_ENABLED` | Enable OpenTelemetry | `false` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTel Collector URL | `http://localhost:4318` |
| `OTEL_SERVICE_NAME` | Service name for telemetry | `auto-repair-shop-api` |
| `LOG_LEVEL` | Pino log level | `info` |

## Testing

```bash
# Unit tests
npx nx test auto-repair-shop

# E2E tests (requires running server)
npx nx e2e auto-repair-shop-e2e
```

## Docker

```bash
docker build -f application/Dockerfile -t auto-repair-shop .
docker run -p 3000:3000 --env-file .env auto-repair-shop
```

## Deployment

Deployed via GitHub Actions (`.github/workflows/cd.yml`):
1. Build Docker image
2. Push to Amazon ECR
3. Apply K8s manifests to EKS
4. Rolling deployment with health check verification

## Kubernetes Manifests

Located in `k8s/`:
- `configmap.yaml` — Application configuration
- `deployment.yaml` — Pod spec with resource limits
- `service.yaml` — ClusterIP service
- `hpa.yaml` — Horizontal Pod Autoscaler (CPU-based)
- `aws/deployment.yaml` — AWS-specific deployment with ECR image
- `aws/external-secrets.yaml` — ExternalSecrets for Secrets Manager
- `monitoring/namespace.yaml` — Monitoring namespace
- `monitoring/otel-collector.yaml` — OpenTelemetry Collector deployment
