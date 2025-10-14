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
- **Routing**: Wouter for lightweight client-side routing with routes for main game (/), database sessions (/database), and mobile views (/mobile)

The frontend follows a component-based architecture with clear separation of concerns between presentation components, state logic, and business rules.

### Key Features
- **Database Sessions View**: Accessible from Settings dialog (password: "MDDS"), displays all stored game sessions with session name, turn information, participants, current phase/team, and deterrence scores. Features robust type safety with comprehensive data normalization to handle various API response structures. Includes research icon (flask) for quick access to Research Dashboard.
- **Analysis Dashboard**: Multi-tab interface (/analysis) featuring:
  - **Generic Patternization**: Discovers all winning strategies and correlations across 7 analysis categories (winning strategies, domain correlations, budget patterns, card effectiveness, timing patterns, turn-by-turn patterns, team-specific formulas)
  - **Predetermined Considerations**: Answers strategic questions about card timing, momentum swings, team asymmetry, comeback triggers, dimension correlation, strategy consistency, and cross-session recurrence. Includes comprehensive card-related statistics:
    - **Most Purchased Cards**: Top 5 most frequently purchased cards with individual purchase counts across all sessions
    - **Card Type Win Rates**: Asset, Permanent, and Expert card purchase totals with calculated win rates (% of purchases leading to victories)
    - **High-Correlation Cards**: Identifies specific cards with ≥60% win rate (minimum 2 uses) showing strong correlation with victory
    - **Permanent Card Holdings**: Average and maximum permanent cards held by winning teams
  - **Ask Questions**: Interactive Q&A interface with LLM-style chat experience for querying selected sessions. Provides authentic, data-driven answers based on real session data (winners, scores, domains, budgets, cards, turns, comparisons)
- **Research Dashboard** (/research): Statistical analysis environment featuring:
  - **Hypothesis Development**: Interactive hypothesis analyzer that intelligently recommends relevant variables based on natural language input. Uses keyword matching and pattern detection to identify team mentions (NATO/Russia), domain references (economy, cyber, space, cognitive, joint), and comparison terms (correlation, impact, versus). Features include:
    - Real-time analysis of hypothesis text with useMemo optimization
    - Smart variable recommendations with deduplication logic
    - Visual distinction between Selected and Recommended variables
    - Bulk "Select All Recommended" functionality
    - Fallback suggestions when hypothesis lacks specific keywords
  - **Session Filtering**: Search, winner filtering, and date-based filtering for research dataset selection
  - **Variable Selection**: 14+ dependent variables (deterrence scores, budget metrics, turn counts) across NATO/Russia teams
  - **Card Purchase Frequency**: Multi-card selection analysis showing percentage of sessions where cards were purchased, with team filtering (Both/NATO/Russia) and session-based percentage calculations using Set-based tracking to prevent >100% values
  - **Descriptive Statistics**: Automated calculation of N, Mean, SD, Min, Max, Range, Median, and IQR for selected variables
  - **Statistical Test Recommendations**: Intelligent recommendation system for 11 statistical methodologies (t-tests, ANOVA, MANOVA, correlation, regression, non-parametric tests) with appropriateness detection based on data characteristics
  - **Scientific Word Document Generation**: Automated creation of publication-ready .docx reports including:
    - Actual statistical calculations (t-tests with p-values, ANOVA with F-statistics, correlation coefficients, regression analyses)
    - Descriptive statistics tables with properly formatted values
    - Embedded statistical charts (bar charts, scatter plots, line graphs) generated server-side
    - Methodology-specific inferential analysis sections with appropriate statistical frameworks
    - APA-style formatting with proper figure/table numbering
    - Summary and interpretation sections following scientific publication standards
  - **Robust Data Validation**: Comprehensive edge-case handling ensures safe defaults when data is insufficient (minimum 2-3 observations per group required)
  - **Report Export**: Download generated reports as professionally formatted Word documents (.docx)
- **Settings Dialog**: Centralized settings interface with collapsible Card Purchase Logs and navigation to database sessions
- **Login Screen**: Glassmorphism interface with session creation and optional "Skip Turn 1" configuration
- **Mobile Interface**: Dedicated mobile views for session management

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

### Research & Statistical Analysis
- **simple-statistics**: Statistical calculations library for t-tests, ANOVA, correlation, and regression analysis
- **docx**: Professional Word document generation with tables, charts, and APA formatting
- **canvas & chartjs-node-canvas**: Server-side chart rendering for embedded visualizations
- **Chart.js**: Statistical chart generation (bar charts, scatter plots, line graphs)

### Database Integration
- **Neon Database**: Serverless PostgreSQL platform (@neondatabase/serverless)
- **Connection Management**: Environment-based database URL configuration
- **Migration System**: Drizzle Kit for schema migrations and database management

### State & Data Management
- **Zustand**: Lightweight state management without boilerplate
- **React Hook Form**: Form state management with validation (@hookform/resolvers)
- **Local Storage**: Browser-based persistence for game state

The application is designed for deployment on platforms like Replit, with database provisioning handled through environment variables and minimal external service dependencies.

## Deployment Documentation

The application includes comprehensive deployment documentation for production environments:

### Deployment Files
- **README.md**: Application overview, features, quick start guide, and technology stack
- **DEPLOYMENT.md**: Complete step-by-step deployment guide for Windows and Linux servers
  - Prerequisites and system requirements
  - Windows Server deployment (IIS/standalone)
  - Linux Server deployment (Ubuntu/CentOS with Nginx)
  - Database setup and configuration
  - SSL/HTTPS configuration
  - Process management with PM2
  - Troubleshooting guide
- **PACKAGING.md**: Instructions for creating deployment packages
  - What to include/exclude in ZIP files
  - Multiple packaging methods (Git, manual, npm scripts)
  - Security best practices
  - Version management
  - Checksum generation
- **.env.example**: Template for environment variables

### Deployment Targets
The application can be deployed to:
- Windows Server 2016+ (IIS or standalone)
- Linux servers (Ubuntu 18.04+, CentOS 7+, Debian 10+)
- Any platform supporting Node.js 18+ and PostgreSQL 14+
- Cloud platforms (AWS, Azure, Google Cloud, DigitalOcean)
- VPS providers with SSH access

### Single-Player AI Features
- **Password Protection**: Single game mode requires password "MDDS"
- **Skip Turn 1**: Optional checkbox to start directly at Turn 2 with pooled budget
- **Balanced AI Strategy**: Russia AI tracks NATO deterrence scores and adapts strategy
  - Gap analysis across all domains
  - Impact-based card selection (not just cost)
  - Budget allocation proportional to deterrence gaps
  - Competitive scoring for engaging gameplay