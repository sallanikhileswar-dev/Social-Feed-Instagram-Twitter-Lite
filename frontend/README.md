# Social Media App - Frontend

React-based frontend for the MERN Social Media Application.

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time WebSocket communication
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first CSS framework
- **Jest & React Testing Library** - Testing framework
- **fast-check** - Property-based testing

## Folder Structure

```
src/
├── pages/          # Route components (HomePage, ProfilePage, etc.)
├── components/     # Reusable UI components (Post, Comment, etc.)
├── services/       # API service functions
├── store/          # Zustand state management stores
├── utils/          # Helper functions and utilities
├── hooks/          # Custom React hooks
├── App.js          # Main application component
└── index.js        # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Build

Create production build:
```bash
npm run build
```

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests in watch mode
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App (one-way operation)

## Requirements

This frontend implements requirements from the MERN Social Media App specification:
- Requirement 12.2: Frontend structure with organized directories
- Requirement 12.3: State management with Zustand
- Requirement 12.4: API service integration with Axios
- Requirement 12.5: Socket.IO client for real-time features
