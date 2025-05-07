# Mini E-Commerce Platform

A simple e-commerce web application with two main tabs: one for submitting products and another for viewing products.

## Features

- **Product Submission**: Add new products with name, price, description, and optional image URL
- **Product Viewing**: See all submitted products in a responsive grid layout
- **Smart Search**: Search for products by name, description, or even context (e.g., "need something to sit on")
- **Clean UI**: Beautiful user interface with responsive design

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL for data storage

## Project Structure

```
.
├── express-app.js         # Main Express.js server with API endpoints
├── setup-database.js      # Database initialization script
├── public/                # Frontend files
│   ├── index-react.html   # HTML entry point for React app
│   └── js/
│       └── react-app.js   # React components
├── start-express.sh       # Script to start the application
└── README.md              # Project documentation
```

## Key Components

### Backend (Express.js)
- RESTful API endpoints for CRUD operations
- PostgreSQL database connection
- Error handling middleware

### Frontend (React.js)
- Modern component-based architecture
- State management with React hooks
- Responsive design with Tailwind CSS
- Interactive product submission form
- Dynamic product grid with search functionality

## Getting Started

1. Run the application:
   ```bash
   ./start-express.sh
   ```
2. Access the application at http://localhost:3000

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `GET /api/products/search` - Search for products