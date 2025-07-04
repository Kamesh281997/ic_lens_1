# Full-Stack Web Application

## Overview

This is a full-stack web application built with React (frontend) and Express.js (backend), featuring user authentication and a modern UI. The application uses TypeScript throughout and implements a clean separation between client and server code with shared types and schemas.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with proper error handling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **User Registration**: Username, email, and password validation
- **Login**: Username/password authentication with bcrypt
- **Password Security**: Salted hashing with configurable rounds
- **Session Management**: Server-side sessions stored in PostgreSQL

### UI Components
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theming**: CSS variables for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Components**: Reusable form components with validation

### Database Schema
- **Users Table**: Core user information with timestamps
- **Validation**: Zod schemas for runtime type checking
- **Type Safety**: Shared types between frontend and backend

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **API Layer**: Express routes handle requests and validate data
3. **Business Logic**: Storage layer abstracts database operations
4. **Database**: Drizzle ORM executes type-safe queries
5. **Response**: JSON responses with proper error handling
6. **Client Update**: TanStack Query manages cache and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **bcrypt**: Password hashing and validation
- **zod**: Runtime type validation
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: Required PostgreSQL connection string
- **NODE_ENV**: Environment-specific configuration
- **Session Storage**: PostgreSQL-based session management

### Production Deployment
- Single-server deployment with static file serving
- Express serves both API endpoints and static React files
- Database migrations handled through Drizzle Kit

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```