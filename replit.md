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
- July 06, 2025. Updated Data Validation page to allow navigation to Payout Calculation and Insights regardless of validation status
- July 06, 2025. Redesigned Payout Calculation page with new column structure: Rep ID, Rep Name, Region, Quota, Actual Sales, Attainment %, Payout Curve Type, Final Payout ($), % of Target Pay, Any Adjustment, Notes
- July 06, 2025. Added comprehensive payout API endpoints with sample data matching new column structure
- July 06, 2025. Created comprehensive Data Insights page with analytics dashboard including summary statistics, performance metrics, territory analysis, and payout distribution visualizations
- July 06, 2025. Implemented tabbed interface for insights with Overview, Performance, Territory, and Distribution sections
- July 07, 2025. Created final_payout_results database table with complete column structure: Rep ID, Rep Name, Region, Quota, Actual Sales, Attainment %, Payout Curve Type, Final Payout ($), % of Target Pay, Any Adjustment, Notes
- July 07, 2025. Updated API endpoints to store and retrieve payout data from PostgreSQL database instead of using static sample data
- July 07, 2025. Implemented user-specific payout data storage with authentication and session management
- July 07, 2025. Added database schema types and validation for final payout results with proper decimal precision for financial data
- July 07, 2025. Completely redesigned landing page with Genpact branding and professional layout
- July 07, 2025. Updated navigation bar with right-aligned menu items (Home, About, Modules, Contact) and increased font sizes
- July 07, 2025. Added Genpact logo to left corner alongside ICLens logo with proper brand hierarchy
- July 07, 2025. Replaced hero section heading with "Calculate IC Plans" and enhanced with Genpact partnership branding
- July 07, 2025. Updated modules section with three modules: IC Plan Configuration, IC Processing, and Payout Insights (renamed from Data Insights)
- July 07, 2025. Added comprehensive footer with three columns: Company Info (Genpact branding and social media), Product links, and Support resources
- July 07, 2025. Implemented responsive design with mobile navigation and professional gradient backgrounds
- July 08, 2025. Implemented comprehensive Genpact design system across all pages with authentic branding
- July 08, 2025. Added complete CSS variable system for Genpact brand colors, typography, and motion
- July 08, 2025. Updated navigation with Genpact design tokens including brand accent (#FF4F59), surface colors, and proper typography scale
- July 08, 2025. Integrated authentic Genpact logo throughout landing page (navigation, hero, footer)
- July 08, 2025. Applied Genpact button system (primary, secondary, ghost) with proper motion and accessibility
- July 08, 2025. Redesigned module cards using Genpact card system with surface-raised background and brand accent colors
- July 08, 2025. Updated footer with Genpact surface-sunken background and proper content hierarchy
- July 08, 2025. Updated hero section layout with image on right side and removed "Calculate IC Plans" text
- July 08, 2025. Implemented two-column hero layout with content on left and incentive compensation analytics image on right
- July 08, 2025. Enhanced module cards with professional icons: Cog for IC Plan Configuration, Zap for IC Processing, PieChart for Payout Insights
- July 08, 2025. Added smooth scrolling navigation to modules section when clicking "Modules" in navigation menu
- July 08, 2025. Implemented smooth scrolling for both desktop and mobile navigation menus
- July 08, 2025. Enhanced Data Insights page typography with larger font sizes across all sections for improved readability
- July 08, 2025. Updated summary cards, section headers, data values, and content text with increased font sizes (text-lg to text-3xl range)
- July 12, 2025. Completely redesigned Data Upload page with modern card-based layout using CSS Grid
- July 12, 2025. Merged required and optional files into single section with 3-column responsive grid (2 on medium, 1 on mobile)
- July 12, 2025. Added visual indicators: red borders for required files, gray styling for optional files
- July 12, 2025. Enhanced upload cards with status indicators, hover effects, and improved user experience
- July 12, 2025. Built comprehensive IC Plan Configuration module with chatbot-style AI assistant
- July 12, 2025. Implemented split-screen layout: 40% chat assistant, 60% configuration tools and summary
- July 12, 2025. Added conversational AI that guides users through plan design with natural language
- July 12, 2025. Created dynamic configuration summary with real-time updates and AI justifications
- July 12, 2025. Integrated pay curve generator with performance vs. payout visualization
- July 12, 2025. Added what-if simulator with payout cost analysis and motivation scoring
- July 12, 2025. Implemented progress tracking with visual indicators and completion percentage
- July 12, 2025. Added plan finalization with export options and database integration
- July 12, 2025. Created API endpoints for IC plan configuration save and retrieval
- July 12, 2025. Built comprehensive Sales Insights section with detailed analytics including total sales, lead conversion, average deal size, top performing products, territory performance, and sales vs target trends
- July 12, 2025. Converted AI Assistant from tab-based to bottom-right corner popup chatbot with minimize/maximize functionality
- July 12, 2025. Implemented RAG (Retrieval-Augmented Generation) AI assistant using Hugging Face API with comprehensive access to all user data including payouts, sales, territories, quotas, and hierarchies
- July 12, 2025. Added intelligent local analysis fallback system for AI assistant that provides detailed insights even without external API access
- July 12, 2025. Enhanced Data Insights page with 5-tab structure: Overview, Sales Insights, Performance, Territory, and Distribution
- July 12, 2025. Created floating AI assistant popup with chat interface, suggested questions, and real-time analytics capabilities
- July 12, 2025. Redesigned Payout Calculation page with comprehensive filter system and enhanced visual design
- July 12, 2025. Moved filter controls to right sidebar with individual icons and colors for each filter type
- July 12, 2025. Added beautiful gradient backgrounds and pattern overlays throughout the application
- July 12, 2025. Implemented side-by-side layout: payout table on left (75% width), filters on right (25% width)
- July 12, 2025. Enhanced filter system with colorful icons: User (blue/green), MapPin (red), Target (purple), BarChart3 (yellow), Percent (orange), TrendingUp (indigo), Settings (gray)
- July 12, 2025. Added backdrop blur effects, semi-transparent cards, and sticky positioning for filter panel
- July 12, 2025. Improved button styling with gradients and enhanced shadows for premium appearance
- July 12, 2025. Optimized payout calculation page layout: reduced margins (px-2 lg:px-4), increased table width to 75% (9/12 columns), fixed table layout with specific column widths to prevent horizontal scrolling, enhanced font sizes throughout table and filters for better readability
- July 12, 2025. Restructured payout calculation page layout: moved filter controls to top position above table, centered the entire layout (max-w-6xl), created vertical stack layout with filters in horizontal grid (8 columns), moved table to center position with full width display
- July 12, 2025. Increased size of filter controls and payout table: expanded container to max-w-7xl, enlarged filter section with text-lg labels, h-12 select triggers, increased spacing (space-y-3, gap-6), enhanced table with text-lg headers and cells, h-14 header rows, h-16 data rows, larger icons (h-6 w-6), improved padding and visual hierarchy
- July 12, 2025. Removed "Calculate Payouts" button from Payout Calculation page and added "Go to Insights" button with purple gradient styling and PieChart icon for navigation to Data Insights page
- July 12, 2025. Decreased left and right margins of Payout Calculation page by simplifying main content container from complex multi-layer padding/margins to minimal px-1 lg:px-2 for better screen utilization
- July 12, 2025. Applied consistent ICLens branding with #ff4f59 red accent color across all pages including logo redesign with red icon and "Lens" text styling
- July 12, 2025. Enhanced signin page with "Back to Home" button, animated background patterns, floating analytics icons, and feature highlights for better visual appeal
- July 12, 2025. Reduced login button size in landing page navigation from excessive padding (pl-[192px] pr-[192px]) to standard px-6 py-2 sizing
- July 12, 2025. Set dark theme as default across entire application by updating ThemeProvider defaultTheme to "dark" and forcing dark class on HTML element initialization
- July 23, 2025. Implemented comprehensive integrated versioning and auditing system with complete version history and detailed audit trail for compliance and transparency
- July 23, 2025. Created PostgreSQL database schema extensions for plan_versions and audit_logs tables with proper relationships and timestamps
- July 23, 2025. Built complete version management functionality: save snapshots at any point, view full history, compare differences, and restore previous versions with single-click recovery
- July 23, 2025. Developed detailed audit trail system that chronologically logs every action for full compliance, tracking who made what change and when for transparency
- July 23, 2025. Enhanced IC Plan Configuration page with versioning controls in header: Version History dialog, Audit Trail dialog, and Create Snapshot button with professional color coding
- July 23, 2025. Implemented server-side API routes for comprehensive version management and audit log viewing with proper authentication and error handling
- July 23, 2025. Added auto-save functionality and audit logging for all configuration changes with detailed change tracking and AI assistant interaction logging
- July 23, 2025. Created comprehensive sample data demonstrating complete versioning workflow: 3 versions with detailed change descriptions and 10 audit log entries showing full compliance trail
- July 23, 2025. Successfully migrated project from Replit Agent to Replit environment with complete database setup and authentication system
- July 23, 2025. Fixed authentication errors by creating PostgreSQL database, pushing schema updates, and establishing proper user management
- July 23, 2025. Created test user accounts for system verification: testuser/password123 and admin/admin123
- July 23, 2025. Successfully completed migration from Replit Agent to Replit environment with full database integration and sample data
- July 23, 2025. Fixed authentication system errors and created test user accounts: testuser/password123, admin/admin123, genpact user
- July 23, 2025. Added comprehensive sample data for IC Plan versioning and audit trail with 3 plan versions and 10 detailed audit log entries
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```