# CRM Backend API

## Overview

This is the backend API for the Customer Relationship Management (CRM) system built with NestJS, PostgreSQL, and Prisma.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (CSO, MANAGER)
- **Customer Management**: CRUD operations with soft delete and merge functionality
- **Feedback Management**: Collect and manage customer feedback
- **Reply Approval Workflow**: CSO drafts replies, Manager approves/rejects
- **Audit Logging**: Track all critical actions for compliance
- **Security**: Password policies, token rotation, input validation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your database credentials and JWT secrets
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, you can access the Swagger documentation at:
`http://localhost:3000/api/docs`

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── customers/    # Customer management
│   ├── feedback/     # Feedback management
│   ├── replies/     # Reply approval workflow
│   └── audit/       # Audit logging
├── core/            # Core infrastructure
│   ├── guards/      # Auth guards
│   ├── filters/     # Exception filters
│   └── interceptors/ # Request/response interceptors
├── shared/          # Shared utilities
│   ├── decorators/  # Custom decorators
│   └── types/       # TypeScript types
└── infra/           # Infrastructure
    ├── prisma/      # Database service
    └── config/      # Configuration
```

## API Endpoints

### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - User logout

### Customers
- `GET /v1/customers` - List customers (with pagination/filters)
- `POST /v1/customers` - Create customer
- `GET /v1/customers/:id` - Get customer by ID
- `PATCH /v1/customers/:id` - Update customer
- `DELETE /v1/customers/:id` - Delete customer (soft delete)
- `POST /v1/customers/:sourceId/merge/:targetId` - Merge customers

### Feedback
- `GET /v1/feedback` - List feedback (with pagination/filters)
- `POST /v1/feedback` - Create feedback
- `GET /v1/feedback/:id` - Get feedback by ID
- `GET /v1/feedback/stats` - Get feedback statistics

### Replies
- `GET /v1/replies` - List replies (with pagination/filters)
- `POST /v1/replies` - Create reply
- `GET /v1/replies/:id` - Get reply by ID
- `PATCH /v1/replies/:id` - Update reply
- `POST /v1/replies/:id/submit` - Submit reply for approval
- `POST /v1/replies/:id/approve` - Approve reply (Manager only)
- `POST /v1/replies/:id/reject` - Reject reply (Manager only)
- `GET /v1/replies/approval-queue` - Get approval queue (Manager only)

### Audit
- `GET /v1/audits` - List audit logs (Manager only)
- `GET /v1/audits/:id` - Get audit log by ID (Manager only)
- `GET /v1/audits/stats` - Get audit statistics (Manager only)
- `GET /v1/audits/my-activity` - Get current user activity
- `GET /v1/audits/resource/:resource` - Get resource history (Manager only)

## User Roles

### CSO (Customer Service Officer)
- View and manage customers
- Create and edit customer records
- View and create feedback
- Draft replies and submit for approval
- View own activity logs

### MANAGER
- All CSO permissions
- Delete customers
- Merge duplicate customers
- Approve/reject replies
- View all audit logs and statistics
- Manage users

## Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

Run tests with coverage:
```bash
npm run test:cov
```

## Database Management

Generate Prisma client:
```bash
npm run prisma:generate
```

Create migration:
```bash
npm run prisma:migrate
```

Reset database:
```bash
npm run prisma:reset
```

Open Prisma Studio:
```bash
npm run prisma:studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `API_PREFIX` | API prefix | `v1` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3001` |

## Security Features

- JWT authentication with refresh token rotation
- Role-based access control (RBAC)
- Password policy enforcement (8+ chars, mixed case, numbers, symbols)
- Input validation and sanitization
- SQL injection prevention via Prisma
- Audit logging for all critical actions
- Rate limiting
- CORS protection

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass before submitting PR

## License

Private - All rights reserved
