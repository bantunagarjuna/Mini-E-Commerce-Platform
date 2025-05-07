# Mini E-Commerce Platform

A simple e-commerce web application with two main tabs: one for submitting products and another for viewing products.

## Features

- **Product Submission**: Add new products with name, price, description, and optional image URL.
- **Product Viewing**: See all submitted products in a responsive grid layout.
- **Smart Search**: Search for products by name, description, or even context (e.g., "need something to sit on").
- **Clean UI**: Beautiful user interface with responsive design.

## Implementation

This project is available in two versions:

### TypeScript/React Version

- **Frontend**: React with Tailwind CSS and shadcn/ui components
- **Backend**: Express.js (TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query

### Plain JavaScript Version

- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Backend**: Express.js (JavaScript)
- **Database**: PostgreSQL with direct queries
- **State Management**: DOM manipulation

### React + Express Version

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Express.js (JavaScript)
- **Database**: PostgreSQL with direct queries
- **State Management**: React hooks

## Setup Instructions

### TypeScript/React Version

1. Start the application using the "Start application" workflow in Replit.
2. This runs the TypeScript backend and React frontend on port 5000.

### Plain JavaScript Version

1. Run the Express.js server with vanilla JS frontend:
   ```bash
   ./start-express.sh
   ```
2. This runs the JavaScript version on port 3000.

### React + Express Version

1. Run the Express.js server with React frontend:
   ```bash
   ./start-express-react.sh
   ```
2. This runs the React + Express.js version on port 3000.

## Tech Stack

- **Frontend**: React.js / Vanilla JavaScript, Tailwind CSS
- **Backend**: Express.js
- **Database**: PostgreSQL
- **Contextual Search**: Keyword matching for basic semantic search