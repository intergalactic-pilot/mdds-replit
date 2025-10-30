# MDDS - Multi Dimension Deterrence Strategy

## Overview
MDDS is an interactive web application for strategic planning and analysis across multiple domains of deterrence. It enables two teams (NATO and Russia) to make strategic decisions using cards representing assets, permanent capabilities, and expert advisors across five domains: Joint, Economy, Cognitive, Space, and Cyber. The application features a turn-based strategy system with budget constraints, deterrence scoring, comprehensive decision logging, and advanced analytical dashboards. The project aims to provide a robust platform for understanding complex deterrence strategies and their outcomes.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses React 18 with Vite, Zustand for state management, Tailwind CSS with shadcn/ui for styling, and Wouter for routing. It follows a component-based architecture.

### Key Features
- **Database Sessions View**: Displays all stored game sessions with detailed information and a link to the Research Dashboard.
- **Analysis Dashboard**: A multi-tab interface for strategic analysis, including:
    - **Generic Patternization**: Discovers winning strategies and correlations across seven categories.
    - **Predetermined Considerations**: Answers strategic questions and provides card-related statistics (e.g., most purchased cards, win rates, high-correlation cards).
    - **Ask Questions**: An interactive Q&A interface using an LLM-style chat for data-driven insights from session data.
- **Research Dashboard**: A statistical analysis environment featuring:
    - **Research Question Tools**: Two independent tools with predefined templates and free-form input, guiding exploratory analysis.
    - **Hypothesis Analyzers**: Two independent analyzers recommending relevant variables based on natural language input.
    - **Statistical Test Recommendations**: Intelligent recommendations for both research questions and hypotheses, providing justifications and application steps.
    - **Session Filtering**: Advanced filtering options for research dataset selection.
    - **Variable Selection**: Over 14 dependent variables for analysis.
    - **Card Purchase Frequency**: Analysis of card purchase percentages across sessions and teams.
    - **Card Rankings by Dimension**: Displays top 5 most-purchased cards by NATO and Russia, per dimension, with detailed statistics.
    - **Descriptive Statistics**: Automated calculation of key statistical measures for selected variables.
    - **Scientific Word Document Generation**: Automated creation of publication-ready .docx reports with statistical calculations, tables, charts, and APA-style formatting.
- **Settings Dialog**: Centralized access to settings and card purchase logs.
- **Login Screen**: Glassmorphism interface for session creation with an optional "Skip Turn 1" feature.
- **Mobile Interface**: Dedicated views for mobile users.
- **Single-Player AI**: Includes a password-protected single-player mode with a balanced Russia AI that adapts its strategy based on NATO's deterrence scores.

### Design System
The application features a Material Design-inspired system with domain-specific accent colors, Inter and JetBrains Mono fonts, light/dark mode support, and a mobile-first responsive layout using Tailwind CSS.

### Business Logic Architecture
Core game logic is modularized, including a Turn Engine, Scoring System, Pricing Logic, Content Guards for text sanitization, and Domain Filters for constraint enforcement.

### State Management
Zustand manages game state, team states, and provides persistence via localStorage, along with comprehensive action logging.

### Data Architecture
A schema-first approach with Zod validation defines card, domain, and team systems, and manages turn-based budgets.

### Backend Architecture
A minimal Express.js server handles static asset serving, development environment, and provides an extensible storage interface, with Drizzle ORM configured for PostgreSQL integration.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM.
- **Build Tools**: Vite, TypeScript.
- **Styling**: Tailwind CSS, PostCSS.

### UI Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Component library built on Radix UI.
- **Lucide React**: Icon library.
- **Class Variance Authority**: Type-safe CSS class composition.

### Development Dependencies
- **Drizzle ORM**: Type-safe database ORM.
- **Zod**: Runtime type validation.
- **ESBuild**: Fast JavaScript bundler.
- **Date-fns**: Date manipulation.

### Research & Statistical Analysis
- **simple-statistics**: Statistical calculations (t-tests, ANOVA, correlation, regression).
- **docx**: Professional Word document generation.
- **canvas & chartjs-node-canvas**: Server-side chart rendering.
- **Chart.js**: Statistical chart generation.

### Database Integration
- **Neon Database**: Serverless PostgreSQL platform.
- **Drizzle Kit**: Schema migrations.

### State & Data Management
- **Zustand**: Lightweight state management.
- **React Hook Form**: Form state management with validation.
- **Local Storage**: Browser-based persistence.