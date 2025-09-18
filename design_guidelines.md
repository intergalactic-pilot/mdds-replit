# MDDS Web Application Design Guidelines

## Design Approach: Design System (Material Design)
**Justification**: This is a utility-focused, information-dense strategic planning application requiring clear hierarchy, excellent readability, and consistent interaction patterns. Material Design provides the structured foundation needed for complex data visualization and decision-making interfaces.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light mode: 63 91% 23% (NATO blue-green)
- Dark mode: 220 85% 25% (deep strategic blue)

**Background Colors:**
- Light mode: 0 0% 98% (near white)
- Dark mode: 220 15% 8% (dark strategic)

**Domain-Specific Accent Colors:**
- Joint: 240 75% 45% (command blue)
- Economy: 120 60% 35% (economic green)
- Cognitive: 280 65% 45% (information purple)
- Space: 200 70% 40% (orbital cyan)
- Cyber: 15 85% 50% (cyber orange)

### Typography
**Font Families**: Inter (primary), JetBrains Mono (data/codes)
**Hierarchy**: 
- Headers: 600 weight, strategic spacing
- Body: 400 weight, high readability
- Data/Stats: 500 weight, tabular alignment

### Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 8, 12, 16
- Micro spacing (2): Button padding, icon gaps
- Standard spacing (4, 8): Component internal spacing
- Section spacing (12, 16): Major layout divisions

### Component Library

**Navigation**: Top-mounted command bar with team status indicators and turn counter

**Team Panels**: Side-mounted panels showing:
- Budget allocation displays with progress bars
- Domain deterrence meters (0-100 scale)
- Active permanent cards with discount indicators

**Card Shop Interface**:
- Filterable grid layout with domain color-coding
- Shopping cart with running totals
- Card preview with detailed effect descriptions

**Strategy Log**: Chronological action feed with:
- Turn-based organization
- Action type icons
- Impact summaries with numerical changes

**Data Displays**:
- Deterrence scoring dashboard
- Budget allocation pie charts
- Turn progression timeline

**Interactive Elements**:
- Prominent action buttons with clear state feedback
- Drag-and-drop card interactions
- Modal dialogs for complex decisions

### Accessibility Features
- Consistent dark mode across all components
- High contrast ratios for strategic data
- Keyboard navigation with visible focus indicators
- Screen reader support with descriptive ARIA labels
- Color-blind friendly domain differentiation using icons + colors

### Visual Hierarchy
- Primary actions: Bold, high-contrast buttons
- Secondary data: Subtle borders and backgrounds
- Critical alerts: Strategic red warnings for budget/constraint violations
- Success states: Muted green confirmations

**Key Principle**: Maintain military/strategic aesthetics while ensuring rapid information processing and decision-making clarity.