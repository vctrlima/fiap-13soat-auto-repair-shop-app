# Auto Repair Shop

API RESTful para gerenciamento de oficina mecânica, construída com Fastify, Prisma e PostgreSQL, seguindo os princípios de Clean Architecture.

---

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [API e Documentação](#api-e-documentação)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Kubernetes](#kubernetes)
- [Observabilidade](#observabilidade)
- [Notas Técnicas](#notas-técnicas)

---

## Visão Geral

Sistema de gerenciamento de oficina mecânica que oferece:

- Cadastro e gestão de **clientes** (CPF/CNPJ)
- Controle de **veículos** (placas brasileiras — modelo clássico e Mercosul)
- Catálogo de **serviços** e **peças/suprimentos**
- Gestão completa de **ordens de serviço** com fluxo de status (Recebida → Diagnóstico → Aguardando Aprovação → Aprovada → Em Execução → Finalizada → Entregue)
- **Autenticação JWT** com access e refresh tokens
- Gerenciamento de **usuários** com papéis (Admin / Default)
- **Notificações por e-mail** para eventos de ordens de serviço
- **Métricas de serviço** com tempo médio de execução

---

## Arquitetura

A aplicação segue **Clean Architecture**, separada em 5 camadas:

```
src/
├── domain/           # Entidades (interfaces), enums, tipos e contratos de use cases
├── application/      # Implementações dos use cases e protocolos (interfaces para DB, crypto, messaging)
├── infra/            # Implementações concretas: Prisma, bcrypt, JWT, Nodemailer, OpenTelemetry
├── presentation/     # Controllers, middlewares de autenticação, erros HTTP
├── validation/       # Validadores: e-mail, senha, documento (CPF/CNPJ), placa
└── main/             # Composition root: rotas, factories, adapters, config, plugins, docs
```

### Fluxo de uma Requisição

```
Request → Fastify Route → Adapter → Controller → Use Case → Repository → PostgreSQL
                              ↑           ↑            ↑
                         Middleware   Validator    Prisma Client
```

### Modelo de Dados

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Customer   │──────▶│   Vehicle    │       │    User      │
│  (CPF/CNPJ)  │       │ (licensePlate)│       │ (email/role) │
└──────┬───────┘       └──────────────┘       └──────────────┘
       │                      │
       ▼                      ▼
┌──────────────────────────────────────┐
│            Work Order                │
│  status: RECEIVED → ... → DELIVERED  │
│  budget: calculado automaticamente   │
├──────────────────┬───────────────────┤
│ WorkOrderService │ WorkOrderPart     │
│  (price, qty)    │  (price, qty)     │
└────────┬─────────┴────────┬──────────┘
         ▼                  ▼
   ┌──────────┐     ┌──────────────┐
   │ Service  │     │ PartOrSupply │
   └──────────┘     └──────────────┘

┌──────────────────┐     ┌──────────────┐
│ ServiceMetrics   │     │ RefreshToken  │
│ (tempo execução) │     │ (JWT refresh) │
└──────────────────┘     └──────────────┘
```

---

## Tecnologias

| Tecnologia          | Versão | Uso                                |
| ------------------- | ------ | ---------------------------------- |
| **Node.js**         | 22     | Runtime                            |
| **TypeScript**      | 5.9    | Linguagem                          |
| **Fastify**         | 5.2    | Framework HTTP                     |
| **Prisma**          | 6.8    | ORM e migrações                    |
| **PostgreSQL**      | 16     | Banco de dados                     |
| **Jest**            | 30     | Testes unitários e E2E             |
| **Docker**          | —      | Containerização                    |
| **GitHub Actions**  | —      | CI/CD                              |
| **OpenTelemetry**   | —      | Traces, métricas e observabilidade |
| **Swagger/OpenAPI** | 3.0    | Documentação da API                |
| **Nodemailer**      | —      | Envio de e-mails                   |

---

## Estrutura do Projeto

```
├── .github/workflows/       # Pipelines CI/CD
│   ├── ci.yml               # Integração contínua
│   └── cd.yml               # Deploy contínuo (AWS EKS)
├── e2e/                     # Testes end-to-end
│   └── src/tests/           # Specs: auth, customers, vehicles, work-orders, etc.
├── k8s/                     # Manifestos Kubernetes
│   ├── deployment.yaml      # Deployments (app + PostgreSQL)
│   ├── service.yaml         # Services (ClusterIP + NodePort)
│   ├── configmap.yaml       # Configurações não sensíveis
│   ├── secret.yaml          # Credenciais (base64)
│   ├── hpa.yaml             # Horizontal Pod Autoscaler
│   ├── aws/                 # Manifestos específicos para AWS EKS
│   └── monitoring/          # OpenTelemetry Collector
├── infra/                   # Terraform (ambiente local com Minikube)
│   └── main.tf
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   ├── migrations/          # Migrações SQL
│   ├── seed.ts              # Seed de desenvolvimento
│   └── seed-production.ts   # Seed de produção (admin user)
├── src/                     # Código-fonte da aplicação
│   ├── main.ts              # Entry point
│   ├── domain/              # Entidades e contratos
│   ├── application/         # Implementações dos use cases
│   ├── infra/               # Prisma, bcrypt, JWT, Nodemailer, OpenTelemetry
│   ├── presentation/        # Controllers e middlewares HTTP
│   ├── validation/          # Validadores de entrada
│   └── main/                # Composição: rotas, factories, config, plugins
├── Dockerfile               # Build multi-stage
├── docker-compose.yml       # Ambiente Docker (app + PostgreSQL)
├── docker-entrypoint.sh     # Migrations + seed + start
└── .env.example             # Variáveis de ambiente
```

---

## Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável                   | Descrição                             | Default                                                                     |
| -------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`             | Connection string do PostgreSQL       | `postgresql://postgres:admin@localhost:5432/auto-repair-shop?schema=public` |
| `SERVER_HOST`              | Host do servidor                      | `http://localhost:3000`                                                     |
| `SERVER_PORT`              | Porta do servidor                     | `3000`                                                                      |
| `PASSWORD_HASH_SALT`       | Rounds do bcrypt                      | `10`                                                                        |
| `JWT_ACCESS_TOKEN_SECRET`  | Secret do access token JWT            | —                                                                           |
| `JWT_REFRESH_TOKEN_SECRET` | Secret do refresh token JWT           | —                                                                           |
| `MAILING_ENABLED`          | Habilitar envio de e-mails            | `true`                                                                      |
| `SMTP_HOST`                | Host do servidor SMTP                 | —                                                                           |
| `SMTP_PORT`                | Porta SMTP                            | `587`                                                                       |
| `SMTP_USERNAME`            | Usuário SMTP                          | —                                                                           |
| `SMTP_PASSWORD`            | Senha SMTP                            | —                                                                           |
| `NODE_ENV`                 | Ambiente (`development`/`production`) | —                                                                           |

---

## Executando a Aplicação

### Com Docker (recomendado)

```bash
docker compose up --build -d
```

Isso sobe dois containers:

- **auto-repair-shop-db** — PostgreSQL 16 (porta 5432)
- **auto-repair-shop-app** — Aplicação Node.js (porta 3000)

O entrypoint executa automaticamente:

1. `prisma migrate deploy` — aplica as migrações
2. `prisma seed-production.ts` — cria o usuário admin
3. Inicia a aplicação

Para acompanhar os logs:

```bash
docker compose logs -f app
```

Para parar:

```bash
docker compose down
```

### Desenvolvimento Local

Requisitos: Node.js 22, Yarn 1.22+, PostgreSQL rodando localmente.

```bash
# Instalar dependências
yarn install

# Gerar Prisma Client
yarn prisma:generate

# Aplicar migrações
yarn prisma:migrate

# Seed do banco (cria admin: admin@email.com / @Abc1234)
yarn prisma:seed

# Iniciar em modo de desenvolvimento
yarn dev
```

### Scripts Disponíveis

| Script                 | Comando                    | Descrição                      |
| ---------------------- | -------------------------- | ------------------------------ |
| `yarn build`           | `tsc -p tsconfig.app.json` | Compila TypeScript             |
| `yarn start`           | `node ... dist/main.js`    | Inicia a aplicação             |
| `yarn dev`             | `tsx watch src/main.ts`    | Desenvolvimento com hot-reload |
| `yarn lint`            | `eslint .`                 | Verifica linting               |
| `yarn test`            | `jest`                     | Testes unitários               |
| `yarn test:e2e`        | `jest (e2e config)`        | Testes end-to-end              |
| `yarn typecheck`       | `tsc --noEmit`             | Verificação de tipos           |
| `yarn prisma:generate` | `prisma generate`          | Gera o Prisma Client           |
| `yarn prisma:migrate`  | `prisma migrate dev`       | Aplica migrações (dev)         |
| `yarn prisma:seed`     | `tsx prisma/seed.ts`       | Seed do banco de dados         |

---

## API e Documentação

A documentação Swagger UI está disponível em:

```
http://localhost:3000/docs
```

### Endpoints

| Recurso            | Prefixo                  | Operações                               |
| ------------------ | ------------------------ | --------------------------------------- |
| **Auth**           | `/api/auth`              | Login, Refresh Token                    |
| **Customers**      | `/api/customers`         | CRUD + busca por documento              |
| **Vehicles**       | `/api/vehicles`          | CRUD                                    |
| **Services**       | `/api/services`          | CRUD                                    |
| **Parts/Supplies** | `/api/parts-or-supplies` | CRUD                                    |
| **Work Orders**    | `/api/work-orders`       | CRUD + aprovar + cancelar               |
| **Users**          | `/api/users`             | CRUD                                    |
| **Metrics**        | `/api/metrics`           | Consulta de métricas de serviço         |
| **Health**         | `/health`                | Health check (status, uptime, recursos) |

### Autenticação

A API usa **Bearer Token (JWT)**. Faça login para obter o token:

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "@Abc1234"}'
```

Use o `accessToken` retornado no header `Authorization: Bearer <token>`.

---

## Testes

### Testes Unitários

```bash
yarn test
```

- Framework: Jest 30 com SWC
- Cobertura mínima: **80%** (branches, functions, lines, statements)
- Saída de cobertura: `test-output/jest/coverage`

### Testes End-to-End

```bash
# Com a aplicação rodando na porta 3000
yarn test:e2e
```

Os testes E2E cobrem todos os fluxos da API: autenticação, CRUD de clientes, veículos, serviços, peças, ordens de serviço e usuários.

---

## CI/CD

### CI — Integração Contínua (`.github/workflows/ci.yml`)

**Trigger:** push na branch `main` e pull requests em qualquer branch.

Executa **4 jobs em paralelo**:

| Job         | Descrição                   |
| ----------- | --------------------------- |
| `lint`      | Verifica padrões de código  |
| `test`      | Executa testes unitários    |
| `build`     | Compila a aplicação         |
| `typecheck` | Verifica tipagem TypeScript |

Todos os jobs usam Node.js 22 com cache do Yarn.

### CD — Deploy Contínuo (`.github/workflows/cd.yml`)

**Trigger:** execução bem-sucedida do CI na branch `main`.

| Job              | Descrição                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-and-push` | Autentica na AWS (OIDC), builda a imagem Docker com Buildx e pusha para o ECR com tags `$sha` e `latest`                                                                                |
| `deploy`         | Lê outputs do Terraform (remote state no S3), atualiza kubeconfig do EKS, substitui placeholders nos manifestos K8s, aplica os manifestos, reinicia o deployment e executa health check |

**Infraestrutura alvo:**

- **ECR**: `010526282303.dkr.ecr.us-east-2.amazonaws.com/vctrlima/fiap-13soat-techchallenge`
- **EKS**: cluster `auto-repair-shop-cluster` em `us-east-2`

---

## Kubernetes

### Manifestos Locais (`k8s/`)

Para deploy em cluster local (Minikube):

```bash
# Aplicar todos os manifestos
kubectl apply -f k8s/

# Verificar pods
kubectl get pods

# Acessar a aplicação
# Via NodePort: http://localhost:30080
# Via port-forward: kubectl port-forward svc/auto-repair-shop-service 3000:80
```

Recursos provisionados:

- **Deployment** da aplicação (2 réplicas) com health probes em `/health`
- **Deployment** do PostgreSQL (1 réplica) com PVC de 5Gi
- **Services**: ClusterIP (porta 80) + NodePort (porta 30080)
- **ConfigMap**: variáveis não sensíveis (host, porta, DB host)
- **Secret**: credenciais de banco, JWT e SMTP (base64)
- **HPA**: escala de 2 a 10 réplicas (CPU 70%, memória 80%)

### Manifestos AWS (`k8s/aws/`)

Usados pelo pipeline de CD para deploy no EKS:

- **deployment.yaml**: Namespace, ServiceAccount (IRSA), ConfigMap, Deployment, Service, TargetGroupBinding (ALB), HPA
- **external-secrets.yaml**: SecretStore + ExternalSecret (AWS Secrets Manager)

### Terraform (`infra/main.tf`)

Provisiona um ambiente Kubernetes local via Minikube com todos os recursos necessários (namespace, deployments, services, HPA, secrets, PVC).

---

## Observabilidade

A aplicação inclui instrumentação com **OpenTelemetry** (habilitada via `OTEL_ENABLED=true`):

### Traces

- Instrumentação automática de requisições HTTP (exclui `/health` e `/documentation`)
- Trace ID e Span ID propagados nos logs para correlação

### Métricas

- `http.server.request.count` — Contador de requisições HTTP
- `http.server.request.duration` — Duração das requisições (histograma)
- `business.work_order.created` — Ordens de serviço criadas
- `business.work_order.completed` — Ordens de serviço finalizadas
- `business.auth.login.count` — Logins realizados
- `business.auth.login.failure` — Falhas de login
- `business.customer.created` — Clientes criados
- `db.query.duration` — Duração de queries no banco
- `db.query.error.count` — Erros de query no banco

### Collector

Os manifestos em `k8s/monitoring/` configuram o **OpenTelemetry Collector** com:

- Receivers OTLP (gRPC :4317, HTTP :4318)
- Exporters: debug + Prometheus
- Health check na porta 13133

---

## Notas Técnicas

### Ordem das Variáveis de Ambiente no Kubernetes

No manifesto de deployment, `DATABASE_URL` usa interpolação `$(VAR)` do Kubernetes. As variáveis referenciadas (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, etc.) **devem ser definidas antes** de `DATABASE_URL`, caso contrário o Kubernetes usará o literal `$(DB_USER)` ao invés do valor real.

### Path Aliases

O projeto usa o alias `@/` para imports:

- **Compile-time** (tsconfig): `@/*` → `src/*`
- **Runtime** (module-alias + tsconfig-paths): `@/*` → `dist/*`

### Validações de Domínio

- **Documento de cliente**: CPF (11 dígitos com validação de dígito verificador) ou CNPJ (14 dígitos com validação)
- **Placa de veículo**: formato clássico `ABC1234` ou Mercosul `ABC1D23`
- **Senha**: mínimo uma letra maiúscula, um número e um caractere especial
- **E-mail**: validação por regex

### Seed de Produção

O Docker entrypoint cria automaticamente o usuário admin:

- **Email**: `admin@email.com`
- **Senha**: `@Abc1234`
- **Role**: `ADMIN`
