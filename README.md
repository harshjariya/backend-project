# Ticket Management Backend API

A production-ready REST API for managing support tickets, featuring robust Role-Based Access Control (RBAC), JWT authentication, and automated status transition logging.

## Core Features

- **Auth System**: Secure JWT-based authentication with password hashing (bcrypt).
- **RBAC Enforcement**: Granular permissions for `MANAGER`, `SUPPORT`, and `USER` roles.
- **Ticket Lifecycle**: Strict workflow management (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).
- **Audit Logging**: Full history of status changes maintained in `TicketStatusLogs`.
- **API Documentation**: Interactive Swagger UI available at `/docs`.
- **Clean Architecture**: Decoupled controllers, routes, and custom middlewares.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+ (using `mysql2/promise`)
- **Security**: JWT, bcryptjs, cookie-parser
- **Docs**: Swagger JSDoc & Swagger UI

## Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MySQL instance running

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ticket_db
JWT_SECRET=your_super_secret_key
```

### 3. Installation
```bash
# Install dependencies
npm install

# Initialize Database and Seed Default Roles
npm run seed
```

### 4. Running the App
```bash
# Development mode
npm run dev
```

## API Documentation
Once the server is running, navigate to:
`http://localhost:3000/docs`

## Database Schema
The system implements the following relational structure:
- `users`: Core account data
- `roles`: RBAC levels (MANAGER, SUPPORT, USER)
- `tickets`: Main support request records
- `ticket_comments`: Interaction history for tickets
- `ticket_status_logs`: Audit trail for lifecycle transitions

---
*Created as part of the Sem-6 Ticket Management project.*
