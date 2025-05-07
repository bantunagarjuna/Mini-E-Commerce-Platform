# Mini E-Commerce Platform

A simple e-commerce web application with two main tabs: one for submitting products and another for viewing products.

## Features

- **Product Submission**: Add new products with name, price, description, and optional image URL.
- **Product Viewing**: See all submitted products in a responsive grid layout.
- **Smart Search**: Search for products by name, description, or even context (e.g., "need something to sit on").
- **Clean UI**: Beautiful user interface with responsive design.

## Implementation

This is a modern web application built with:

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL for data storage
- **State Management**: React hooks

## Setup Instructions

1. Run the Express.js server with React frontend:
   ```bash
   ./start-express.sh
   ```
2. This runs the application on port 3000.

## Project Structure

- **Backend**: Express.js server in `express-app.js`
- **Frontend**: React components in `public/js/react-app.js`
- **Database**: PostgreSQL connection in `express-app.js`

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Express.js on Node.js
- **Database**: PostgreSQL
- **Contextual Search**: Keyword matching for basic semantic search