# ICLens Authentication System

## Overview

This is a comprehensive web application for ICLens, an AI-Powered Incentive Compensation Platform, built with React (frontend) and Express.js (backend). The application features a modern landing page and complete authentication system with login, signup, and password reset functionality. The UI supports both light and dark themes with a sleek, professional design. The application uses TypeScript throughout and implements a clean separation between client and server code with shared types and schemas.

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

### Landing Page
- **Hero Section**: Large-scale welcome message with clear call-to-action
- **Navigation**: Responsive navigation with mobile menu support
- **Feature Cards**: Interactive cards for IC Plan Configuration, IC Processing, and IC Insights & Analytics
- **Professional Design**: Dark theme with red accent colors matching the brand

### About Page
- **Company Mission**: Detailed explanation of ICLens mission and vision
- **Feature Highlights**: Key capabilities including automation, collaboration, and security
- **Company Story**: Background and founding story of ICLens
- **Call-to-Action**: Direct link to authentication for user engagement

### Contact Page
- **Contact Form**: Interactive form for user inquiries with validation
- **Contact Information**: Complete business details including email, phone, and address
- **Business Hours**: Operating hours and availability information
- **Quick Actions**: Direct links to trial signup, demo scheduling, and more information

### Authentication System
- **User Registration**: Username, email, and password validation
- **Login**: Username/password authentication with bcrypt
- **Password Security**: Salted hashing with configurable rounds
- **Session Management**: Server-side sessions stored in PostgreSQL

### UI Components
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theming**: CSS variables for consistent theming with dark mode support
- **Theme Toggle**: Light/dark mode switching with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Components**: Reusable form components with validation
- **Brand Colors**: Custom ICLens color scheme for consistent branding

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
- July 04, 2025. Updated branding from ILens to ICLens
- July 04, 2025. Added dark mode support with theme toggle
- July 04, 2025. Enhanced UI with dark mode styling for all components
- July 04, 2025. Created professional landing page with hero section and feature cards
- July 04, 2025. Added responsive navigation with mobile menu support
- July 04, 2025. Integrated landing page routing to authentication system
- July 04, 2025. Created comprehensive About page with company mission and story
- July 04, 2025. Built Contact page with interactive form and business information
- July 04, 2025. Updated routing system to include About and Contact pages
- July 04, 2025. Implemented complete session management with PostgreSQL storage
- July 04, 2025. Added user authentication state tracking and persistent login
- July 04, 2025. Built ICLens MVP with data upload, IC processing, validation, and analytics
- July 04, 2025. Created database schema for IC plans, file uploads, sales data, and payouts
- July 04, 2025. Developed complete workflow: Upload → Processing → Validation → Calculation
- July 04, 2025. Implemented workflow routing: IC Processing → Data Upload → Validation → Payout
- July 04, 2025. Added redirect parameters for seamless authentication flow
- July 04, 2025. Updated landing page with proper workflow navigation
- July 04, 2025. Enhanced authentication flow: Login button returns to landing page
- July 04, 2025. Added smart "GET STARTED" button that adapts to authentication status
- July 04, 2025. Created Data Insights page with "coming soon" message for authenticated users
- July 04, 2025. Updated landing page: "Validation" renamed to "Data Insights"
- July 04, 2025. Created IC Plan Configuration page with "coming soon" message for all users
- July 04, 2025. Updated first landing page card to show coming soon for authenticated and unauthenticated users
- July 04, 2025. Updated Data Insights to show coming soon message for all users (authenticated and unauthenticated)
- July 04, 2025. Fixed IC Processing navigation: "Back to Home" button now correctly goes to home page
- July 04, 2025. Updated IC Processing page: Product Name dropdown with "Prevnar-B" option
- July 04, 2025. Updated IC Processing page: Team Name dropdown with "VS" and "VIS" options
- July 04, 2025. Added quota data upload option to Data Upload page
- July 04, 2025. Added paycurve selection (Goal Attainment vs Goal Attainment with Relative Rank) to Data Upload page
- July 04, 2025. Implemented conditional paycurve enabling based on IC plan type selection from IC Processing page
- July 04, 2025. Changed Data Upload page back button from "Back to Home" to "Back to IC Processing"
- July 04, 2025. Made hierarchy, target pay, and paycurve optional (light shade) while other options are mandatory
- July 04, 2025. Redesigned Data Upload page with individual file upload for each option
- July 04, 2025. Added individual upload buttons and status tracking for each file type
- July 04, 2025. Added "Back to Home" and "Proceed to Validation" action buttons
- July 04, 2025. Created hierarchy database table with columns: TeamID, TERR_ID, TERR_NAME, ROLE_CD, LEVEL1_PARENT_ID, LEVEL1_PARENT_NAME, LEVEL_1_PARENT_ROLE_CD, LEVEL2_PARENT_ID, LEVEL2_PARENT_NAME, LEVEL_2_PARENT_ROLE_CD
- July 04, 2025. Implemented CSV file processing for hierarchy uploads with multer and csv-parser
- July 04, 2025. Added real file upload functionality that stores hierarchy data in PostgreSQL database
- July 04, 2025. Created complete database schema for all file upload types: rep_roster (REP_ID, REP_NAME, EMAIL_ID), rep_assignment (TERR_ID, REP_ID, START_DATE, END_DATE), sales_data_detailed (48 product/market columns), quota_data_detailed (48 product/market columns), pay_curve_goal_attainment (Percentile Rank, Bonus Attainment), pay_curve_goal_rank_attainment (Goal Attainment, Bonus Attainment)
- July 04, 2025. Enhanced file upload processing to handle all 6 file types with proper CSV parsing and database insertion
- July 04, 2025. Added sample data for all database tables to verify proper structure and data flow
- July 06, 2025. Updated IC Processing page: Changed "Proceed to Validation" to "Proceed to Data Upload" button
- July 06, 2025. Added "Skip to Data Validation" bypass button on IC Processing page for flexible navigation
- July 06, 2025. Enhanced Data Validation page with post-validation navigation options to Payout Calculation Table and Insights Page
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```