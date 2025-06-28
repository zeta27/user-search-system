# User Search System

## Overview

This is a full-stack web application built with React (frontend) and Express.js (backend) that allows users to search for information by email address and provides an admin interface for managing user data through CSV uploads. The system uses a PostgreSQL database with Drizzle ORM and features a modern UI built with shadcn/ui components and Tailwind CSS.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Processing**: Multer for file uploads, csv-parser for CSV processing
- **Storage Strategy**: In-memory storage with interface for future database integration

### Database Schema
The application uses a simple user schema:
```typescript
usuarios {
  id: serial (primary key)
  usuario: text (not null)
  correo: text (not null, unique)
}
```

## Key Components

### Frontend Components
1. **SearchPage** (`/`): Main interface for email-based user lookup
2. **AdminPage** (`/admin`): Administrative interface for CSV uploads and user management
3. **UI Components**: Comprehensive set of shadcn/ui components for consistent design

### Backend Services
1. **Storage Interface**: Abstraction layer with in-memory implementation (`MemStorage`)
2. **Route Handlers**: 
   - `/api/search` - Email-based user lookup
   - `/api/upload` - CSV file upload and processing
   - `/api/usuarios` - User listing (admin)

### Shared Schema
- Centralized type definitions in `shared/schema.ts`
- Zod validation schemas for runtime type checking
- Drizzle schema definitions for database operations

## Data Flow

### User Search Flow
1. User enters email on search page
2. Frontend sends POST request to `/api/search`
3. Backend queries storage by email (case-insensitive)
4. Returns user data if found, error message if not found

### CSV Upload Flow
1. Admin selects CSV/Excel file on admin page
2. File uploaded via multipart form to `/api/upload`
3. Backend processes file (CSV parsing or Excel conversion)
4. Data validated against schema
5. Users created in storage with duplicate handling
6. Success/error feedback returned to frontend

### Data Storage
- Current implementation uses in-memory storage (`MemStorage`)
- Storage interface designed for easy migration to database
- Email indexing for fast lookups
- Auto-incrementing ID generation

## External Dependencies

### Database
- **Drizzle ORM**: Modern TypeScript ORM
- **Neon Database**: Serverless PostgreSQL provider
- **Configuration**: Environment variable `DATABASE_URL` required

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push`

### Environment Requirements
- Node.js with ES modules support
- PostgreSQL database (via Neon or compatible provider)
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `NODE_ENV`: Development/production mode

### Serving Strategy
- Production: Express serves built React app as static files
- Development: Vite dev server with Express API proxy
- File uploads stored in `uploads/` directory (temporary)

## Changelog
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.