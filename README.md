# MDDS - Multi Dimension Deterrence Strategy

An interactive web application for strategic planning and analysis across multiple domains of deterrence, featuring NATO vs Russia strategic scenarios with turn-based mechanics, AI gameplay, and comprehensive analytics.

## Features

### Core Gameplay
- **Two-Player Mode**: Strategic NATO vs Russia scenarios with turn-based mechanics
- **Single-Player AI Mode**: Play against an intelligent AI opponent (password: MDDS)
- **Five Strategic Domains**: Joint, Economy, Cognitive, Space, and Cyber
- **Card System**: Three card types (Assets, Permanents, Experts) with unique effects
- **Budget Management**: Turn-based budgets with pooled and restricted modes
- **Deterrence Tracking**: Real-time scoring across all domains

### Advanced Features
- **Database Sessions**: Store and retrieve game sessions with password protection
- **Analysis Dashboard**: Multi-tab interface with pattern recognition and strategic insights
  - Generic Patternization: Discover winning strategies across 7 analysis categories
  - Predetermined Considerations: Answer strategic questions with card statistics
  - Ask Questions: Interactive Q&A with LLM-style responses
  
- **Research Dashboard**: Statistical analysis environment
  - Hypothesis Development with smart variable recommendations
  - Session Filtering and multi-variable selection
  - Descriptive Statistics (N, Mean, SD, Min, Max, Range, Median, IQR)
  - Statistical Test Recommendations (11 methodologies)
  - Scientific Word Document Generation with APA formatting

- **Mobile Interface**: Dedicated mobile views for session management
- **PDF/Word Reports**: Generate professional research documents
- **Strategy Logging**: Comprehensive action tracking with timestamps

### Technical Features
- Real-time state synchronization
- PostgreSQL database integration
- Responsive Material Design UI
- Light/dark theme support
- Password-protected sections
- Automated AI decision-making with balanced strategy

## Quick Start

### For Users
1. Open the application in your web browser
2. Enter session details on the login screen
3. Choose between Two-Player or Single-Player (password: MDDS) mode
4. Optional: Check "Skip Turn 1" to start at Turn 2
5. Make strategic purchases and advance through turns
6. Access Analytics and Research dashboards for insights

### Default Passwords
- **Single Player Mode**: `MDDS`
- **Database Sessions**: `MDDS`
- **Permanent Cards Logs**: `MDDS`

## Deployment

📚 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions**

### Subdomain Configuration

For deployments where frontend and backend run on different subdomains, follow this setup:

#### Frontend Configuration (.env)
```
# Set your backend API URL (different subdomain)
VITE_API_URL=https://api.example.com
```

#### Backend Configuration (.env)
```
# Allow requests from your frontend subdomain(s)
FRONTEND_URL=https://app.example.com

# For multiple frontend origins:
FRONTEND_URL=https://app.example.com,https://www.app.example.com
```

The CORS middleware will automatically:
- Allow credentials (cookies) across subdomains
- Accept specified HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Allow necessary headers (Content-Type, Authorization)
- Cache preflight requests for 24 hours

#### Local Development Setup
```
Frontend: http://localhost:5173
Backend: http://localhost:5050

# .env file
VITE_API_URL=http://localhost:5050
FRONTEND_URL=http://localhost:5173
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions with examples for different hosting providers.

### Quick Deployment Summary

#### Windows Server
```cmd
# Install Node.js 18+ and PostgreSQL
# Create database
npm install
npm run db:push
npm run build
npm start
```

#### Linux Server
```bash
# Install Node.js 18+ and PostgreSQL
# Create database
npm install
npm run db:push
npm run build
pm2 start npm --name "mdds" -- start
```

For detailed step-by-step instructions, environment setup, troubleshooting, and production configuration, refer to the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

## System Requirements

### Minimum
- Node.js 18 or higher
- PostgreSQL 14 or higher
- 2GB RAM
- 5GB disk space

### Recommended
- Node.js 20 LTS
- PostgreSQL 15+
- 4GB RAM
- 10GB SSD storage

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for development and bundling
- Tailwind CSS + shadcn/ui components
- Zustand for state management
- React Query for data fetching
- Wouter for routing

### Backend
- Express.js server
- Drizzle ORM with PostgreSQL
- Zod for validation
- Session management with express-session

### Analysis & Research
- simple-statistics for statistical calculations
- docx for Word document generation
- Chart.js for data visualization
- Server-side chart rendering with canvas

## Project Structure

```
mdds-app/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   ├── state/       # Zustand store
│   │   ├── logic/       # Game logic
│   │   └── utils/       # Utility functions
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database interface
│   └── index.ts         # Server entry point
├── shared/              # Shared TypeScript types
│   └── schema.ts        # Database schema
├── DEPLOYMENT.md        # Deployment guide
└── README.md           # This file
```

## Game Mechanics

### Turn Structure
1. **Purchase Phase**: Select cards from available inventory
2. **Commit Phase**: Finalize purchases and calculate deterrence
3. **Advance Phase**: Move to next turn with refreshed budgets

### Budget System
- **Turn 1**: Base turn with 200K per domain (1000K total, domain-restricted)
- **Turn 2+**: Pooled budget of 1000K (spend across any domain)
- Permanent cards provide discounts on future purchases

### Deterrence Calculation
- Each card has effects on one or more domains
- Effects can benefit your team or penalize opponents
- Total deterrence determines strategic advantage
- Final scores calculated at game conclusion

## AI Strategy (Single Player)

The AI opponent uses a balanced strategy that:
- Analyzes deterrence gaps across all domains
- Prioritizes domains where it's falling behind
- Selects cards based on impact value, not just cost
- Balances permanent cards with immediate effects
- Adapts dynamically to player decisions
- Maintains competitive scoring for engaging gameplay

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run database migrations
npm run db:push

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret
NODE_ENV=development
```

## API Endpoints

- `POST /api/sessions` - Create new game session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:name` - Get specific session
- `PUT /api/sessions/:name` - Update session
- `POST /api/analysis/ask` - Query session data
- `POST /api/research/generate-report` - Generate research document

## Security Notes

- All sensitive operations are password-protected
- Session secrets should be randomly generated
- Database credentials should never be committed
- Use HTTPS in production environments
- Keep dependencies updated regularly

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- React Query caching for API requests
- Optimistic UI updates
- Lazy loading for heavy components
- Server-side chart generation
- Database indexing on frequently queried fields

## Troubleshooting

Common issues and solutions are documented in [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting).

For quick fixes:
- **Database connection**: Check `.env` credentials and PostgreSQL service
- **Port conflicts**: Change port in `server/index.ts`
- **Memory issues**: Increase Node.js heap size with `--max-old-space-size`
- **Build errors**: Clear `node_modules` and reinstall

## License

This application is proprietary software for strategic planning and analysis.

## Support

For deployment assistance or technical issues, refer to:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
2. Application logs via PM2: `pm2 logs mdds`
3. Database logs in PostgreSQL log directory

---

**Version**: 1.0.0  
**Last Updated**: October 2025
