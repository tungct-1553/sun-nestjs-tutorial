# sun-nestjs-tutorial

Backend API cho dự án Medium clone (RealWorld spec), xây dựng với NestJS theo kiến trúc **Flat Clean Architecture**.

## Tài liệu tham khảo

- [Tutorial](./docs/tutorial.md)
- [RealWorld API Spec](https://realworld-docs.netlify.app/specifications/backend/endpoints/)

## Path aliases

Import giữa các layer dùng alias (cấu hình trong `tsconfig.json`):

| Alias | Layer |
|-------|-------|
| `@domain/*` | Domain models, exceptions |
| `@application/*` | Use cases, ports, tokens |
| `@presentation/*` | Controllers, DTOs, filters |
| `@infrastructure/*` | Entities, repositories, DB |
| `@main/*` | Modules, config, composition root |

Ví dụ:

```typescript
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';
import { User } from '@domain/models/user';
import { UserEntity } from '@infrastructure/entities/user.entity';
```

## Cấu trúc dự án

```
src/
├── domain/                    # core business (Pure TypeScript)
│   ├── models/
│   └── exceptions/
├── application/               # Use Cases & Ports (framework-free)
│   ├── use-cases/
│   └── ports/
│       ├── inbound/           # Driving ports (use-case contracts)
│       ├── outbound/          # Driven ports (repository, gateway)
│       └── tokens.ts          # DI injection tokens
├── presentation/              # HTTP adapters (Controllers, DTOs, Filters)
│   ├── controllers/
│   ├── dtos/
│   ├── filters/
│   └── resolvers/
├── infrastructure/            # DB, external services, mappers
│   ├── database/
│   ├── entities/
│   ├── repositories/
│   ├── mappers/
│   └── external-services/
└── main/                      # Composition root (NestJS modules)
    ├── config/                # App bootstrap config (env, DB, JWT)
    ├── app.module.ts
    └── health.module.ts
```

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

```bash
# Development (hot reload)
npm run start:dev
```

API chạy tại `http://localhost:3000/api`.

### Endpoints khởi tạo

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/health` | Health check |

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run start:dev` | Chạy dev server |
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