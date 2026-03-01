# Auto Repair Shop — API

RESTful API for auto repair shop management, built with Fastify, Prisma and PostgreSQL following Clean Architecture principles. Manages customers, vehicles, services, parts/supplies, work orders, users and JWT-based authentication.

> **Part of the [Auto Repair Shop](https://github.com/fiap-13soat) ecosystem.**
> Deploy order: **K8s Infra → Lambda → DB → App (this repo)**

---

## Deploy Links

| Environment | URL |
| ----------- | --- |
| **Production** | `https://api.auto-repair-shop.com` |
| **Staging** | `https://staging-api.auto-repair-shop.com` |
| **Swagger UI** | `https://api.auto-repair-shop.com/docs` |

---

## Table of Contents

- [Purpose](#purpose)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Kubernetes](#kubernetes)
- [Observability](#observability)
- [Documentation](#documentation)
- [Technical Notes](#technical-notes)
- [Related Repositories](#related-repositories)

---

## Purpose

Full-featured auto repair shop management system providing:

- **Customer** registration and lookup (CPF/CNPJ validation)
- **Vehicle** management (Brazilian license plate formats — classic & Mercosul)
- **Service** and **Parts/Supplies** catalog
- **Work Order** lifecycle (Received → Diagnosis → Waiting Approval → Approved → In Execution → Finished → Delivered)
- **JWT authentication** with access & refresh tokens (user login + customer CPF auth via Lambda)
- **User** management with roles (Admin / Default)
- **Email notifications** for work order events
- **Service metrics** tracking (average execution time)

---

## Architecture

### System Overview

```mermaid
graph LR
    Client([Client])
    APIGW[API Gateway]
    Lambda[Lambda - CPF Auth]
    ALB[ALB]
    EKS[EKS Cluster]
    App[Fastify App]
    RDS[(RDS PostgreSQL)]

    Client --> APIGW
    APIGW -- "POST /api/auth/cpf" --> Lambda
    APIGW -- "ANY /api/{proxy+}" --> ALB
    APIGW -- "GET /health, /docs" --> ALB
    Lambda --> RDS
    ALB --> EKS
    EKS --> App
    App --> RDS

    style App fill:#4da6ff,stroke:#0066cc,color:#fff
```

### Clean Architecture Layers

The application follows **Clean Architecture**, organized in 5 layers:

```mermaid
graph TD
    subgraph "Presentation Layer"
        Routes[Fastify Routes]
        Adapter[Route Adapter]
        Controller[Controllers]
        Middleware[Auth Middleware]
    end

    subgraph "Validation Layer"
        Validators[Email / Password / Document / License Plate]
    end

    subgraph "Application Layer"
        UseCases[Use Cases]
        Protocols[Protocols - Interfaces]
    end

    subgraph "Domain Layer"
        Entities[Entities / Enums / Types]
    end

    subgraph "Infrastructure Layer"
        Prisma[Prisma ORM]
        Bcrypt[Bcrypt]
        JWT[JWT]
        Mailer[Nodemailer]
        OTEL[OpenTelemetry]
    end

    Routes --> Adapter --> Controller
    Controller --> Validators
    Controller --> UseCases
    UseCases --> Protocols
    Protocols --> Prisma
    Protocols --> Bcrypt
    Protocols --> JWT
    Protocols --> Mailer
    Middleware --> JWT
```

### Request Flow

```
Request → Fastify Route → Adapter → Controller → Use Case → Repository → PostgreSQL
                              ↑           ↑            ↑
                         Middleware   Validator    Prisma Client
```

### Sequence Diagrams

#### Authentication Flow (CPF)

```mermaid
sequenceDiagram
    actor Client
    participant APIGW as API Gateway
    participant Lambda as Lambda (Auth)
    participant RDS as RDS PostgreSQL

    Client->>APIGW: POST /api/auth/cpf { cpf }
    APIGW->>Lambda: Invoke (public route)
    Lambda->>Lambda: Validate CPF format (11 digits)
    Lambda->>Lambda: Validate CPF check digits
    Lambda->>RDS: SELECT Customer WHERE document = $1
    alt Customer found
        RDS-->>Lambda: Customer { id, name, email, document }
        Lambda->>Lambda: Sign JWT (sub, name, cpf, type, exp:15m)
        Lambda-->>APIGW: 200 { accessToken, customer }
        APIGW-->>Client: 200 { accessToken, customer }
    else Customer not found
        RDS-->>Lambda: Empty result
        Lambda-->>APIGW: 404 { message: "Customer not found" }
        APIGW-->>Client: 404
    end

    Note over Client,APIGW: Subsequent requests use JWT
    Client->>APIGW: GET /api/* (Authorization: Bearer JWT)
    APIGW->>APIGW: JWT Authorizer validates token
    alt Token valid
        APIGW->>Client: Forward to ALB → EKS
    else Token invalid/expired
        APIGW-->>Client: 401 Unauthorized
    end
```

#### Work Order Creation Flow

```mermaid
sequenceDiagram
    actor Client
    participant APIGW as API Gateway
    participant ALB as ALB
    participant App as Fastify App (EKS)
    participant DB as RDS PostgreSQL
    participant Mail as SMTP (Nodemailer)
    participant OTEL as OpenTelemetry

    Client->>APIGW: POST /api/work-orders (Bearer JWT)
    APIGW->>APIGW: JWT Authorizer validates token
    APIGW->>ALB: Forward request
    ALB->>App: Route to pod

    App->>App: Auth Middleware extracts user from JWT
    App->>App: Controller validates request body
    App->>App: Validate customerId, vehicleId exist

    App->>DB: BEGIN TRANSACTION
    App->>DB: INSERT WorkOrder (status: OPEN)
    App->>DB: INSERT WorkOrderService[] (foreach service)
    App->>DB: INSERT WorkOrderPartOrSupply[] (foreach part)
    App->>DB: COMMIT

    App->>OTEL: Increment business.work_order.created
    App->>OTEL: Record http.server.request.duration

    App->>Mail: Send notification email (async)

    App-->>ALB: 201 { workOrder }
    ALB-->>APIGW: 201
    APIGW-->>Client: 201 { workOrder }

    Note over Client,DB: Status transitions
    Client->>APIGW: PATCH /api/work-orders/:id/status
    APIGW->>ALB: Forward (JWT valid)
    ALB->>App: Route to pod
    App->>DB: UPDATE WorkOrder SET status = $1
    App->>OTEL: Record status transition time
    alt Status = DONE/CLOSED
        App->>OTEL: Increment business.work_order.completed
    end
    App-->>Client: 200 { workOrder }
```

### Data Model

```mermaid
erDiagram
    Customer ||--o{ Vehicle : owns
    Customer ||--o{ WorkOrder : requests
    Vehicle ||--o{ WorkOrder : "is serviced in"
    WorkOrder ||--o{ WorkOrderService : contains
    WorkOrder ||--o{ WorkOrderPartOrSupply : contains
    WorkOrder ||--o{ ServiceMetrics : tracks
    WorkOrderService }o--|| Service : references
    WorkOrderPartOrSupply }o--|| PartOrSupply : references
    ServiceMetrics }o--|| Service : measures
    User ||--o{ RefreshToken : has

    Customer {
        uuid id PK
        string document UK
        string name
        string email
        string phone
    }

    Vehicle {
        uuid id PK
        uuid customer_id FK
        string license_plate UK
        string brand
        string model
        int year
    }

    WorkOrder {
        uuid id PK
        uuid customer_id FK
        uuid vehicle_id FK
        Status status
        float budget
    }

    Service {
        uuid id PK
        string name UK
        string description
        float price
    }

    PartOrSupply {
        uuid id PK
        string name UK
        string description
        float price
        int in_stock
    }

    User {
        uuid id PK
        string name
        string email UK
        string password
        UserRole role
    }

    RefreshToken {
        uuid id PK
        string token UK
        datetime expires_at
        uuid user_id FK
    }

    ServiceMetrics {
        uuid id PK
        uuid work_order_id FK
        uuid service_id FK
        datetime started_at
        datetime finished_at
    }

    WorkOrderService {
        uuid id PK
        uuid work_order_id FK
        uuid service_id FK
        float price
    }

    WorkOrderPartOrSupply {
        uuid id PK
        uuid work_order_id FK
        uuid part_or_supply_id FK
        int quantity
        float price
    }
```

---

## Technologies

| Technology          | Version | Purpose                         |
| ------------------- | ------- | ------------------------------- |
| **Node.js**         | 22      | Runtime                         |
| **TypeScript**      | 5.9     | Language                        |
| **Fastify**         | 5.2     | HTTP framework                  |
| **Prisma**          | 6.16    | ORM & migrations                |
| **PostgreSQL**      | 16      | Database                        |
| **Jest**            | 30      | Unit & E2E testing (with SWC)   |
| **Docker**          | —       | Containerization (multi-stage)  |
| **Kubernetes**      | —       | Orchestration (local + AWS EKS) |
| **Terraform**       | —       | Local Minikube IaC              |
| **GitHub Actions**  | —       | CI/CD pipelines                 |
| **OpenTelemetry**   | —       | Distributed tracing & metrics   |
| **Swagger/OpenAPI** | 3.0     | API documentation               |
| **Nodemailer**      | —       | Email notifications             |
| **Bcrypt**          | 6.0     | Password hashing                |

---

## Project Structure

```
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml               # Continuous integration
│   └── cd.yml               # Continuous deployment (AWS EKS)
├── e2e/                     # End-to-end tests
│   └── src/tests/           # Specs: auth, customers, vehicles, work-orders, etc.
├── k8s/                     # Kubernetes manifests
│   ├── deployment.yaml      # Deployments (app + PostgreSQL)
│   ├── service.yaml         # Services (ClusterIP + NodePort)
│   ├── configmap.yaml       # Non-sensitive config
│   ├── secret.yaml          # Credentials (base64)
│   ├── hpa.yaml             # Horizontal Pod Autoscaler
│   ├── aws/                 # AWS EKS-specific manifests
│   └── monitoring/          # OpenTelemetry Collector
├── infra/                   # Terraform (local Minikube environment)
│   └── main.tf
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # SQL migrations
│   ├── seed.ts              # Development seed
│   └── seed-production.ts   # Production seed (admin user)
├── src/                     # Application source code
│   ├── main.ts              # Entry point
│   ├── domain/              # Entities and contracts
│   ├── application/         # Use case implementations
│   ├── infra/               # Prisma, bcrypt, JWT, Nodemailer, OTEL
│   ├── presentation/        # Controllers and HTTP middlewares
│   ├── validation/          # Input validators
│   └── main/                # Composition root: routes, factories, config, plugins
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Docker environment (app + PostgreSQL)
└── docker-entrypoint.sh     # Migrations + seed + start
```

---

## Getting Started

### Prerequisites

- Node.js 22 and Yarn 1.22+
- Docker & Docker Compose (recommended)
- PostgreSQL 16 (if running without Docker)

### Running with Docker (recommended)

```bash
docker compose up --build -d
```

This starts two containers:

- **auto-repair-shop-db** — PostgreSQL 16 (port 5432)
- **auto-repair-shop-app** — Node.js application (port 3000)

The entrypoint automatically runs:

1. `prisma migrate deploy` — applies migrations
2. `prisma seed-production.ts` — creates admin user
3. Starts the application

```bash
# Follow logs
docker compose logs -f app

# Stop
docker compose down
```

### Local Development (without Docker)

```bash
# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma:generate

# Apply migrations
yarn prisma:migrate

# Seed the database (creates admin: admin@email.com / @Abc1234)
yarn prisma:seed

# Start in development mode (with hot-reload)
yarn dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                   | Description                  | Default                                                                     |
| -------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`             | PostgreSQL connection URL    | `postgresql://postgres:admin@localhost:5432/auto-repair-shop?schema=public` |
| `SERVER_HOST`              | Server host                  | `http://localhost:3000`                                                     |
| `SERVER_PORT`              | Server port                  | `3000`                                                                      |
| `PASSWORD_HASH_SALT`       | Bcrypt rounds                | `10`                                                                        |
| `JWT_ACCESS_TOKEN_SECRET`  | JWT access token secret      | —                                                                           |
| `JWT_REFRESH_TOKEN_SECRET` | JWT refresh token secret     | —                                                                           |
| `MAILING_ENABLED`          | Enable email sending         | `true`                                                                      |
| `SMTP_HOST`                | SMTP server host             | —                                                                           |
| `SMTP_PORT`                | SMTP port                    | `587`                                                                       |
| `SMTP_USERNAME`            | SMTP username                | —                                                                           |
| `SMTP_PASSWORD`            | SMTP password                | —                                                                           |
| `NODE_ENV`                 | `development` / `production` | —                                                                           |

### Available Scripts

| Script                 | Command                    | Description                 |
| ---------------------- | -------------------------- | --------------------------- |
| `yarn build`           | `tsc -p tsconfig.app.json` | Compile TypeScript          |
| `yarn start`           | `node ... dist/main.js`    | Start the application       |
| `yarn dev`             | `tsx watch src/main.ts`    | Development with hot-reload |
| `yarn lint`            | `eslint .`                 | Check code standards        |
| `yarn test`            | `jest`                     | Run unit tests              |
| `yarn test:e2e`        | `jest (e2e config)`        | Run end-to-end tests        |
| `yarn typecheck`       | `tsc --noEmit`             | Type checking               |
| `yarn prisma:generate` | `prisma generate`          | Generate Prisma Client      |
| `yarn prisma:migrate`  | `prisma migrate dev`       | Apply migrations (dev)      |
| `yarn prisma:seed`     | `tsx prisma/seed.ts`       | Seed the database           |

### Deploy to AWS (EKS)

Deployment to AWS is automated via GitHub Actions CD pipeline. See [CI/CD](#cicd) for details.

For manual Kubernetes deployment, see [Kubernetes](#kubernetes).

---

## API Documentation (Swagger)

Once the application is running, the **Swagger UI** is available at:

```
http://localhost:3000/docs
```

The API is documented with **OpenAPI 3.0** and includes all endpoints, schemas, and authentication requirements.

### Endpoints Overview

| Resource           | Prefix                   | Operations                               |
| ------------------ | ------------------------ | ---------------------------------------- |
| **Auth**           | `/api/auth`              | Login, Refresh Token                     |
| **Customers**      | `/api/customers`         | CRUD + search by document                |
| **Vehicles**       | `/api/vehicles`          | CRUD                                     |
| **Services**       | `/api/services`          | CRUD                                     |
| **Parts/Supplies** | `/api/parts-or-supplies` | CRUD                                     |
| **Work Orders**    | `/api/work-orders`       | CRUD + approve + cancel                  |
| **Users**          | `/api/users`             | CRUD                                     |
| **Metrics**        | `/api/metrics`           | Service metrics query                    |
| **Health**         | `/health`                | Health check (status, uptime, resources) |

### Authentication

The API uses **Bearer Token (JWT)**. Login to obtain a token:

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "@Abc1234"}'
```

Use the returned `accessToken` in the `Authorization: Bearer <token>` header.

---

## Testing

### Unit Tests

```bash
yarn test
```

- Framework: Jest 30 with SWC for fast compilation
- Minimum coverage: **80%** (branches, functions, lines, statements)
- Coverage output: `test-output/jest/coverage`

### End-to-End Tests

```bash
# With the application running on port 3000
yarn test:e2e
```

E2E tests cover all API flows: authentication, CRUD for customers, vehicles, services, parts, work orders, and users.

---

## CI/CD

### CI — Continuous Integration (`.github/workflows/ci.yml`)

**Trigger:** Push to `main` and pull requests on any branch.

Runs **4 parallel jobs**:

| Job         | Description              |
| ----------- | ------------------------ |
| `lint`      | Code standards check     |
| `test`      | Unit tests               |
| `build`     | Application compilation  |
| `typecheck` | TypeScript type checking |

All jobs use Node.js 22 with Yarn cache.

### CD — Continuous Deployment (`.github/workflows/cd.yml`)

**Trigger:** Successful CI run on `main`.

| Job              | Description                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `build-and-push` | Authenticates to AWS (OIDC), builds Docker image with Buildx, pushes to ECR (`$sha` + `latest`) |
| `deploy`         | Reads Terraform remote state, updates EKS kubeconfig, applies K8s manifests, health check       |

---

## Kubernetes

### Local Manifests (`k8s/`)

For local cluster deployment (Minikube):

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods

# Access the application
# Via NodePort: http://localhost:30080
# Via port-forward: kubectl port-forward svc/auto-repair-shop-service 3000:80
```

Provisioned resources:

- **Deployment** — app (2 replicas) with health probes at `/health`
- **Deployment** — PostgreSQL (1 replica) with 5Gi PVC
- **Services** — ClusterIP (port 80) + NodePort (port 30080)
- **ConfigMap** — non-sensitive variables
- **Secret** — database, JWT and SMTP credentials (base64)
- **HPA** — scales 2–10 replicas (CPU 70%, memory 80%)

### AWS Manifests (`k8s/aws/`)

Used by the CD pipeline for EKS deployment:

- **deployment.yaml** — Namespace, ServiceAccount (IRSA), ConfigMap, Deployment, Service, TargetGroupBinding (ALB), HPA
- **external-secrets.yaml** — SecretStore + ExternalSecret (AWS Secrets Manager)

### Terraform (`infra/main.tf`)

Provisions a local Kubernetes environment via Minikube with all required resources (namespace, deployments, services, HPA, secrets, PVC).

---

## Observability

Instrumentation with **OpenTelemetry** (enabled via `OTEL_ENABLED=true`):

### Traces

- Automatic HTTP request instrumentation (excludes `/health` and `/documentation`)
- Trace ID and Span ID propagated in logs for correlation

### Metrics

| Metric                          | Type      | Description             |
| ------------------------------- | --------- | ----------------------- |
| `http.server.request.count`     | Counter   | HTTP requests count     |
| `http.server.request.duration`  | Histogram | Request duration        |
| `business.work_order.created`   | Counter   | Work orders created     |
| `business.work_order.completed` | Counter   | Work orders completed   |
| `business.auth.login.count`     | Counter   | Successful logins       |
| `business.auth.login.failure`   | Counter   | Login failures          |
| `business.customer.created`     | Counter   | Customers created       |
| `db.query.duration`             | Histogram | Database query duration |
| `db.query.error.count`          | Counter   | Database query errors   |

### Collector

Manifests in `k8s/monitoring/` configure the **OpenTelemetry Collector** with:

- OTLP receivers (gRPC :4317, HTTP :4318)
- Exporters: Grafana Cloud (OTLP) + Prometheus + debug
- Health check on port 13133

### Dashboards (Grafana)

Pre-configured dashboards in `k8s/monitoring/grafana-dashboards.yaml`:

- **Overview Dashboard**: Volume diário de OS, latência (p50/p90/p99), taxa de requisições, erros de DB, falhas de login, uptime
- **Work Orders Dashboard**: Tempo médio por status (Diagnóstico/Execução/Finalização), volume por dia, erros e falhas nas integrações

### Alertas

Regras de alerta em `k8s/monitoring/alerting-rules.yaml`:

| Alerta | Severidade | Condição |
| ------ | ---------- | -------- |
| HighAPILatency | warning | p95 > 2s por 5min |
| CriticalAPILatency | critical | p99 > 5s por 3min |
| HighErrorRate | critical | 5xx > 5% por 5min |
| ApplicationDown | critical | Health check down por 1min |
| WorkOrderProcessingFailure | critical | >10 DB errors em 15min |
| NoWorkOrdersCreated | warning | 0 OS em 24h |
| HighDatabaseQueryLatency | warning | p95 > 1s por 5min |
| DatabaseQueryErrors | critical | >0.5 erros/s por 5min |
| HighLoginFailureRate | warning | >50 falhas/hora |
| HighCPUUsage | warning | >80% por 10min |
| HighMemoryUsage | warning | >85% por 10min |
| PodRestartLoop | critical | >3 restarts/hora |

---

## Documentation

- **Architecture Decision Records (ADRs)**: [`docs/adrs/`](docs/adrs/)
  - [ADR-001: Padrão de Comunicação REST](docs/adrs/ADR-001-padrao-comunicacao-rest.md)
- **Sequence Diagrams**: Included in this README ([Authentication Flow](#authentication-flow-cpf), [Work Order Creation](#work-order-creation-flow))
- **ER Diagram**: Included in this README ([Data Model](#data-model))

### Branch Protection

All repositories follow these branch protection rules (configured in GitHub):

- **Branch `main`**: protected — no direct pushes allowed
- **Merge via Pull Request only**: all changes require a PR with at least 1 approval
- **CI must pass**: status checks (lint, test, build, typecheck) must succeed before merge
- **Branch `staging`**: used for homologation deployments, auto-deployed via CD pipeline
- **Automatic deploys**: staging (on push to `staging`), production (on push to `main`)

---

## Technical Notes

### Kubernetes Environment Variable Order

In the deployment manifest, `DATABASE_URL` uses Kubernetes `$(VAR)` interpolation. Referenced variables (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, etc.) **must be defined before** `DATABASE_URL`, otherwise Kubernetes will use the literal `$(DB_USER)` instead of the actual value.

### Path Aliases

The project uses the `@/` alias for imports:

- **Compile-time** (tsconfig): `@/*` → `src/*`
- **Runtime** (module-alias + tsconfig-paths): `@/*` → `dist/*`

### Domain Validations

- **Customer document**: CPF (11 digits with check digit validation) or CNPJ (14 digits with validation)
- **Vehicle license plate**: classic format `ABC1234` or Mercosul `ABC1D23`
- **Password**: minimum one uppercase letter, one number and one special character
- **Email**: regex validation

### Production Seed

The Docker entrypoint automatically creates the admin user:

- **Email**: `admin@email.com`
- **Password**: `@Abc1234`
- **Role**: `ADMIN`

---

## Related Repositories

This project is part of the **Auto Repair Shop** ecosystem. Deploy in this order:

| #   | Repository                                                                                                  | Description                                     |
| --- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | [`fiap-13soat-auto-repair-shop-k8s`](https://github.com/vctrlima/fiap-13soat-auto-repair-shop-k8s)       | AWS infrastructure (VPC, EKS, ALB, API Gateway) |
| 2   | [`fiap-13soat-auto-repair-shop-lambda`](https://github.com/vctrlima/fiap-13soat-auto-repair-shop-lambda) | CPF authentication Lambda function              |
| 3   | [`fiap-13soat-auto-repair-shop-db`](https://github.com/vctrlima/fiap-13soat-auto-repair-shop-db)         | Database infrastructure (RDS PostgreSQL)        |
| 4   | **`fiap-13soat-auto-repair-shop-app`** (this repo)                                                          | Application API                                 |
