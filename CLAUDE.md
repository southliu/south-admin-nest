# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript admin application in its initial state. It uses NestJS v10.0.0, TypeScript v5.1.3, and pnpm as the package manager.

## Common Commands

**Development:**
- `pnpm run start` - Run in production mode
- `pnpm run start:dev` - Run with file watching
- `pnpm run start:debug` - Run with debug mode
- `pnpm run start:prod` - Run compiled application from /dist

**Build & Lint:**
- `pnpm run build` - Compile TypeScript to /dist
- `pnpm run lint` - Run ESLint with auto-fix
- `pnpm run format` - Format code with Prettier

**Testing:**
- `pnpm run test` - Run unit tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Run test coverage
- `pnpm run test:debug` - Run tests with debugger
- `pnpm run test:e2e` - Run end-to-end tests

## Architecture

This is a standard NestJS modular application following the framework's conventions:

**Entry Points:**
- `src/main.ts` - Application bootstrap and Nest app creation
- `src/app.module.ts` - Root module that orchestrates the application

**Module Organization:**
- Controllers handle HTTP requests using decorators (@Controller, @Get, @Post, etc.)
- Services contain business logic and are injected via constructor injection
- Modules encapsulate related functionality with @Module decorator
- The project currently has minimal structure with only a "Hello World!" endpoint at GET /

**Key Patterns:**
- Dependency injection throughout the application
- Decorator-based routing and metadata
- Separation of concerns: controllers → services → repositories (when implemented)
- DTOs (Data Transfer Objects) for request/response validation
- Guards for authentication/authorization
- Interceptors for request/response transformation
- Middleware for cross-cutting concerns

**Test Structure:**
- Unit tests in `*.spec.ts` files alongside source files
- E2E tests in `/test` directory using supertest
- Jest with NestJS Testing utilities

**Configuration:**
- TypeScript targets ES2021 with CommonJS modules
- Source maps enabled for debugging
- Decorator metadata enabled for framework support
