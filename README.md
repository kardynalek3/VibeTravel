# VibeTravels

> AI-powered trip planning made simple - Turn your travel notes into detailed itineraries

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

VibeTravels is a responsive web application that generates detailed trip plans based on user notes and travel preferences using LLM's. The app converts simplified notes about places and destinations into specific, feasible itineraries for trips lasting one to five days.

### Target Users

- Families
- Couples
- Solo travelers

### Key Features

- User account system with profiles containing travel preferences
- Creating notes about future trips
- AI-generated itineraries based on notes
- Viewing and filtering other users' trip plans
- Exporting plans to PDF format
- Liking public plans

### Problem Solved

Planning engaging and interesting trips requires significant time, knowledge, and research to identify attractions, optimize routes, and consider practical aspects like opening hours and travel time. VibeTravels streamlines this process by transforming simple notes into detailed, executable plans that consider:

- User travel preferences
- Available trip time
- Realistic attraction visit durations and travel time
- Attraction closures and holidays
- Suggested attractions from the user

## Tech Stack

### Frontend
- Astro 5
- React 19
- TypeScript 5
- Tailwind 4
- Shadcn/ui

### Backend
- Supabase

### AI Integration
- Communication with models through Openrouter.ai

### CI/CD & Hosting
- GitHub Actions
- DigitalOcean

## Getting Started Locally

### Prerequisites

- Node.js **22.14.0** (recommended to use [nvm](https://github.com/nvm-sh/nvm) with the included `.nvmrc` file)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kardynalek3/VibeTravel.git
   cd VibeTravel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

## Available Scripts

| Command          | Description                                      |
|------------------|--------------------------------------------------|
| `npm run dev`    | Start the development server                     |
| `npm run build`  | Build the project for production                 |
| `npm run preview`| Preview the production build locally             |
| `npm run astro`  | Run Astro CLI commands                           |
| `npm run lint`   | Run ESLint to check for code issues              |
| `npm run lint:fix`| Fix ESLint issues automatically                 |
| `npm run format` | Format code with Prettier                        |

## Project Scope

### Included in MVP

- User account system with profiles containing travel preferences
- Creating, reading, browsing, and deleting notes about future trips
- AI-generated itineraries based on notes
- Displaying trip plans with visit and travel times
- Setting plans as public or private
- Filtering and sorting public trip plans
- Simple admin panel with basic metrics
- Exporting plans to PDF
- Liking other users' plans

### Not Included in MVP

- Sharing trip plans between accounts
- Rich multimedia handling (e.g., photos of places to visit)
- Advanced time and logistics planning
- Commenting on other users' plans
- Keyword search for plans
- Integration with booking systems (hotels, tickets)
- User notification system
- Multilingual support
- Budget consideration in trip plans

### Technical Constraints

- Trip duration: Minimum 1 day, maximum 5 days
- Plan generation limit: Maximum 2 per day per user
- Maximum plan generation time: 3 minutes
- Maximum page load time: 2 minutes
- Field size limitations: Maximum 5000 characters for attractions, 500 for other fields

## Project Structure

```
.
├── src/              # Source code
│   ├── layouts/      # Astro layouts
│   ├── pages/        # Astro pages
│   │   └── api/      # API endpoints
│   ├── middleware/   # Astro middleware
│   ├── db/           # Supabase clients and types
│   ├── types.ts      # Shared types (Entities, DTOs)
│   ├── components/   # Client-side components
│   │   └── ui/       # Shadcn/ui components  
│   ├── lib/          # Services and helpers
│   └── assets/       # Static internal assets
└── public/           # Public assets
```

## Project Status

VibeTravels is currently in the development phase and under active development.

After the initial release, success will be evaluated over a 3-month period based on the following metrics:
- User engagement (profile completion, plan generation frequency, likes)
- System performance (generation time, success rate, page load time)
- User base growth (new registrations, retention rate)

## License

This project is licensed under the [MIT License](LICENSE). 