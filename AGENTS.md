# AGENTS.md

This file provides guidance to agentic coding agents working with this NestJS TypeScript admin application.

## Build, Lint & Test Commands

### Development Commands

- `pnpm run start:dev` - Run with file watching (primary development mode)
- `pnpm run start:debug` - Run with debug mode and file watching
- `pnpm run start` - Run in production mode
- `pnpm run start:prod` - Run compiled application from /dist

### Build & Code Quality

- `pnpm run build` - Compile TypeScript to /dist directory
- `pnpm run lint` - Run ESLint with auto-fix across src, apps, libs, test
- `pnpm run format` - Format code with Prettier across src/**/\*.ts and test/**/\*.ts

### Testing Commands

- `pnpm run test` - Run all unit tests (Jest with ts-jest)
- `pnpm run test:watch` - Run tests in watch mode for continuous testing
- `pnpm run test:cov` - Run test coverage analysis
- `pnpm run test:debug` - Run tests with debugger support
- `pnpm run test:e2e` - Run end-to-end tests using supertest
- `pnpm run test path/to/file.spec.ts` - Run single test file (use Jest pattern matching)
- `pnpm run test -- --testNamePattern="specific test name"` - Run tests matching name pattern

### Database Commands

- `pnpm run db:init` - Initialize database with seed data using ts-node

## Code Style Guidelines

### Import Organization

- Group imports: 1) External libraries, 2) @nestjs/\* modules, 3) Internal modules, 4) Relative imports
- Use named imports where possible: `import { Controller, Get } from '@nestjs/common'`
- Keep imports at file top, sorted alphabetically within groups
- Avoid default exports except for main entry points

### TypeScript Configuration

- Target ES2021 with CommonJS modules
- Decorators enabled: `experimentalDecorators: true`, `emitDecoratorMetadata: true`
- Strict mode partially disabled: `noImplicitAny: false`, `strictNullChecks: false`
- Source maps enabled for debugging

### Naming Conventions

- **Files**: kebab-case for modules (user-profile.service.ts), PascalCase for classes
- **Classes**: PascalCase (UserProfileService, UserController)
- **Methods**: camelCase (getUserById, createArticle)
- **Variables**: camelCase (userData, articleList)
- **Constants**: UPPER_SNAKE_CASE for environment variables and constants
- **Entities**: PascalCase, extend BaseEntity (User, Article, Menu)

### NestJS Patterns

- **Controllers**: Use @Controller decorator, inject services via constructor
- **Services**: Use @Injectable decorator, contain business logic
- **Modules**: Use @Module decorator, organize related functionality
- **DTOs**: Use class-validator decorators, separate files in dto/ folders
- **Entities**: Use TypeORM decorators, extend BaseEntity for common fields
- **Guards**: Implement CanActivate interface for authentication/authorization

### Error Handling

- Use NestJS built-in exceptions: `UnauthorizedException`, `BadRequestException`, etc.
- Return standardized responses using ApiResponse class:
  - `ApiResponse.success(data, message)` for successful operations
  - `ApiResponse.error(message, code, data)` for errors
- Use try-catch blocks in service methods for database operations
- Validate input using ValidationPipe with class-validator decorators

### Database & TypeORM

- Entities extend BaseEntity with id, createdAt, updatedAt, isDeleted, deletedAt
- Use soft deletes via isDeleted flag and DeleteDateColumn
- MySQL database with utf8mb4 charset and +08:00 timezone
- Synchronize enabled in development (be careful in production)

### Authentication & Authorization

- JWT-based authentication using JwtAuthGuard
- Use @Public() decorator for public endpoints
- Access current user via @CurrentUser() decorator
- Token format: Bearer {token} in Authorization header

### Response Format

- All API responses should use ApiResponse wrapper
- Pagination responses use PaginatedResponse class
- Include timestamp in all responses
- Use consistent HTTP status codes

### Code Formatting (Prettier)

- Single quotes: `"singleQuote": true`
- Trailing commas: `"trailingComma": "all"`
- Auto-format on save recommended

### ESLint Rules

- TypeScript ESLint parser with recommended rules
- Prettier integration enabled
- Explicit return types disabled for flexibility
- Interface name prefix disabled

### Testing Guidelines

- Unit tests in \*.spec.ts files alongside source files
- Use NestJS Testing utilities for controller/service testing
- Mock external dependencies in tests
- Test coverage should include business logic and edge cases
- E2E tests in /test directory using supertest

### File Structure

```
src/
├── common/          # Shared utilities, guards, decorators, entities
├── system/          # User, role, permission, menu management
├── contents/        # Content management (articles, etc.)
├── dashboard/       # Dashboard functionality
├── app.module.ts    # Root module
└── main.ts          # Application bootstrap
```

### Environment Configuration

- Use .env file for environment variables
- ConfigModule with isGlobal: true
- Database connection via TypeOrmModule.forRootAsync
- CORS enabled for all origins in development

### Development Best Practices

- Always run lint and format before commits
- Use dependency injection throughout the application
- Follow NestJS decorator patterns consistently
- Implement proper error handling and validation
- Use TypeORM entities for database operations
- Test business logic thoroughly
- Keep controllers thin, services contain business logic
