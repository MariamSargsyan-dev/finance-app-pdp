# Personal Finance Tracker

Full-stack expense tracking application built with Domain-Driven Design principles.

## Tech Stack

- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: React + Vite + TypeScript + SCSS
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions + Docker + GHCR

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL

### Setup

1. **Install dependencies:**
```bash
cd apps/api && npm install
cd ../web && npm install
```

2. **Configure environment:**
```bash
# Create apps/api/.env with:
NODE_ENV=development
PORT=8787
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:3000
```

3. **Run migrations:**
```bash
cd apps/api
npm run migration:run
```

4. **Start development servers:**
```bash
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Web
cd apps/web && npm run dev
```

- API: http://localhost:8787
- Web: http://localhost:3000

## Project Structure

```
apps/
├── api/          # NestJS backend (DDD architecture)
└── web/          # React frontend
```

## License

MIT
