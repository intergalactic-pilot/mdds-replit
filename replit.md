# MDDS - Multi Dimension Deterrence Strategy

## Overview

MDDS is an interactive web application for strategic planning and analysis across multiple domains of deterrence. The system enables two teams (NATO and Russia) to make strategic decisions using cards representing assets, permanent capabilities, and expert advisors across five domains: Joint, Economy, Cognitive, Space, and Cyber. The application implements a turn-based strategy system with budget constraints, deterrence scoring, and comprehensive logging of strategic decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application is built using a modern React-based architecture with TypeScript:

- **Framework**: React 18 with Vite for development and bundling
- **State Management**: Zustand store for global game state management
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **UI Components**: Radix UI primitives providing accessible, customizable components
- **Routing**: Wouter for lightweight client-side routing

The frontend follows a component-based architecture with clear separation of concerns between presentation components, state logic, and business rules.

### Design System
The application implements a Material Design-inspired system with:

- **Color Palette**: Domain-specific accent colors (Joint: gray, Economy: green, Cognitive: purple, Space: blue, Cyber: yellow)
- **Typography**: Inter font family for primary text, JetBrains Mono for data display
- **Theme Support**: Light/dark mode switching with CSS custom properties
- **Responsive Layout**: Mobile-first design approach with Tailwind breakpoints

### Business Logic Architecture
Core game logic is separated into specialized modules:

- **Turn Engine** (`turnEngine.ts`): Manages turn phases (purchase → commit → advance) and validates domain spending restrictions
- **Scoring System** (`scoring.ts`): Calculates deterrence effects and applies card impacts across domains
- **Pricing Logic** (`pricing.ts`): Handles permanent card discounts and budget calculations
- **Content Guards** (`guards.ts`): Runtime text sanitization replacing forbidden words ("game", "operation") with "strategy"
- **Domain Filters** (`filters.ts`): Enforces card quotas and domain-based constraints

### State Management
Zustand provides centralized state management with:

- **Game State**: Turn tracking, phase management, team states
- **Team State**: Individual budgets, deterrence scores, owned cards, shopping carts
- **Persistence**: localStorage integration for save/load/export/import functionality
- **Action Logging**: Comprehensive strategy log with timestamps and team attribution

### Data Architecture
The application uses a schema-first approach with Zod validation:

- **Card System**: Three card types (asset, permanent, expert) with different behaviors and effects
- **Domain System**: Five domains with individual deterrence tracking and budget allocation
- **Team System**: NATO vs Russia with independent state management
- **Turn System**: Base turn (200K per domain) vs pooled turns (1000K total budget)

### Backend Architecture
Minimal Express.js server providing:

- **Static Asset Serving**: Production build serving with Vite integration
- **Development Server**: Hot module replacement and error overlay support
- **Storage Interface**: Extensible storage abstraction (currently in-memory, designed for database expansion)
- **Database Schema**: Drizzle ORM configuration prepared for PostgreSQL integration

The backend is designed as a lightweight foundation that can be extended with database persistence, user authentication, and multiplayer functionality.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state synchronization
- **Build Tools**: Vite for development server and production bundling, TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling, PostCSS for processing

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **Lucide React**: Icon library providing consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition

### Development Dependencies
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect support
- **Zod**: Runtime type validation and schema definition
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Date-fns**: Date manipulation and formatting utilities

### Database Integration
- **Neon Database**: Serverless PostgreSQL platform (@neondatabase/serverless)
- **Connection Management**: Environment-based database URL configuration
- **Migration System**: Drizzle Kit for schema migrations and database management

### State & Data Management
- **Zustand**: Lightweight state management without boilerplate
- **React Hook Form**: Form state management with validation (@hookform/resolvers)
- **Local Storage**: Browser-based persistence for game state

The application is designed for deployment on platforms like Replit, with database provisioning handled through environment variables and minimal external service dependencies.