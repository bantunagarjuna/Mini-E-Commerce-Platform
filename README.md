# Mini E-Commerce Platform

A lightweight e-commerce platform designed for seamless product browsing and management with enhanced functionality for product interactions.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript with React (via CDN)
- **Backend**: Node.js
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS (via CDN)

## Setup Instructions

### Prerequisites

- Node.js (v18.x or higher)
- PostgreSQL database

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/mini-ecommerce-platform.git
cd mini-ecommerce-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up your PostgreSQL database and make sure to update the database connection string in the application as needed.

4. Start the server:
```bash
npm run dev
```

The server will start on port 5000 by default. You can access the API endpoints at `http://localhost:5000/api/`.

### Frontend Setup

The frontend is served automatically by the Node.js server, so once the backend is running, you can access the web application by visiting:

```
http://localhost:5000
```

## Features Implemented

- ✅ Responsive user interface with clean, modern design
- ✅ Two main tabs: Product browsing and product submission
- ✅ Product submission form with validation
- ✅ Product browsing with card layout
- ✅ Product search functionality
- ✅ Product deletion with confirmation dialog
- ✅ Real-time feedback and toast notifications
- ✅ PostgreSQL database integration
- ✅ Responsive design that works well on mobile, tablet, and desktop


## Database Structure

The application uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `DELETE /api/products/:id` - Delete a product by ID
- `GET /api/products/search?q=query` - Search products by name or description

## Author

Bantu Nagajuna