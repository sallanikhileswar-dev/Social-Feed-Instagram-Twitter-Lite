# MERN Social Media Application - Backend

Backend API for the MERN Social Media Application built with Node.js, Express, MongoDB, and Socket.IO.

## Features

- User authentication with JWT (access and refresh tokens)
- User profiles with follow/unfollow functionality
- Posts with images, likes, comments, and reposts
- Real-time messaging with Socket.IO
- Real-time notifications
- Stories (24-hour temporary content)
- Search functionality for users and posts
- Admin moderation tools
- Rate limiting and security middleware

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Jest** - Testing framework
- **fast-check** - Property-based testing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secrets
   - Cloudinary credentials
   - Email service credentials

### Running the Application

Development mode with hot reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── __tests__/       # Test files
├── server.js        # Entry point
└── package.json
```

## API Documentation

API endpoints will be documented as they are implemented.

## Environment Variables

See `.env.example` for all required environment variables.

## License

ISC
