# sun-nestjs-tutorial

Backend cho dự án Medium clone (RealWorld spec), xây dựng với NestJS theo kiến trúc **Flat Clean Architecture**. Hỗ trợ hai delivery mechanism: **HTTP API** và **CLI**.

## Tài liệu tham khảo

- [Tutorial](./docs/tutorial.md)
- [RealWorld API Spec](https://realworld-docs.netlify.app/specifications/backend/endpoints/)

## Path aliases

Import giữa các layer dùng alias (cấu hình trong `tsconfig.json`):

| Alias | Layer |
|-------|-------|
| `@domain/*` | Domain models, exceptions |
| `@application/*` | Use cases, ports, tokens |
| `@presentation/*` | API controllers/DTOs/filters, CLI commands |
| `@infrastructure/*` | Entities, repositories, DB |
| `@main/*` | Modules, config, composition root |

Ví dụ:

```typescript
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';
import { HealthController } from '@presentation/api/controllers/health.controller';
import { HealthCommand } from '@presentation/cli/commands/health.command';
import { User } from '@domain/models/user';
import { UserEntity } from '@infrastructure/entities/user.entity';
```

## Cấu trúc dự án

```
src/
├── domain/                    # Core business (Pure TypeScript)
│   ├── models/
│   └── exceptions/
├── application/               # Use Cases & Ports (framework-free)
│   ├── use-cases/
│   └── ports/
│       ├── inbound/           # Driving ports (use-case contracts)
│       ├── outbound/          # Driven ports (repository, gateway)
│       └── tokens.ts          # DI injection tokens
├── presentation/              # Driving adapters (delivery mechanism)
│   ├── api/                   # HTTP adapters
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── filters/
│   │   └── resolvers/
│   └── cli/                   # CLI adapters
│       ├── commands/
│       └── handlers/
├── infrastructure/            # DB, external services, mappers
│   ├── database/
│   ├── entities/
│   ├── repositories/
│   ├── mappers/
│   └── external-services/
├── main/                      # Composition root (NestJS modules)
│   ├── config/                # App bootstrap config (env, DB, JWT)
│   ├── modules/               # Feature modules (core / api / cli)
│   ├── app.module.ts          # API composition root
│   └── app.cli.module.ts      # CLI composition root
├── main.ts                    # HTTP API entry point
└── cli.ts                     # CLI entry point
```

### Module composition (API + CLI)

Mỗi feature được tách thành 3 module để API và CLI dùng chung use case:

```
HealthCoreModule   → use case + DI token (shared)
HealthApiModule    → controller  → import bởi AppModule
HealthCliModule    → command     → import bởi AppCliModule
```

Khi thêm feature mới:

1. Tạo use case + inbound port trong `application/`
2. **API**: controller + DTO trong `presentation/api/`
3. **CLI**: command trong `presentation/cli/commands/`
4. Wire module: `XxxCoreModule` → `XxxApiModule` / `XxxCliModule`

## Yêu cầu

- Node.js 20+
- Docker & Docker Compose (cho PostgreSQL)

## Cài đặt

```bash
# Cài dependencies
npm install

# Copy file môi trường
cp .env.example .env

# Khởi động PostgreSQL
npm run docker:up
```

## Chạy ứng dụng

### HTTP API

```bash
# Development (hot reload)
npm run start:dev
```

API chạy tại `http://localhost:3000/api`.

#### Endpoints khởi tạo

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/health` | Health check |

### CLI

```bash
# Development (hot reload)
npm run start:cli:dev -- health

# Production (sau khi build)
npm run build
npm run start:cli:prod -- health
```

#### Commands khởi tạo

| Command | Mô tả |
|---------|-------|
| `health` | Health check (output JSON) |

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run start:dev` | Chạy API dev server |
| `npm run start:cli` | Chạy CLI |
| `npm run start:cli:dev` | Chạy CLI với hot reload |
| `npm run start:cli:prod` | Chạy CLI production |
| `npm run build` | Build production |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | ESLint |
| `npm run docker:up` | Khởi động PostgreSQL |
| `npm run docker:down` | Dừng PostgreSQL |
| `npm run migration:generate --name=MigrationName` | Tạo migration từ entities |
| `npm run migration:run` | Chạy pending migrations |
| `npm run migration:revert` | Rollback migration cuối |

## Biến môi trường

Xem [`.env.example`](./.env.example).

## Lộ trình phát triển

Theo [tutorial](./docs/tutorial.md):

1. **Init codebase** — cấu trúc dự án, TypeORM, config, ports/tokens, migrations
2. **Init model** — entities, relationships, generate & run migrations (User, Article, Comment, Tag, ...)
3. **Feature PRs** — Authentication, CRUD Articles, Comments, ...