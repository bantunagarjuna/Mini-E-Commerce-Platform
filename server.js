const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const path = require('path');

// Create the Express app
const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection setup
const setupDatabase = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Did you forget to provision a database?");
    return null;
  }
  
  // Configure Neon database
  const neonConfig = require('@neondatabase/serverless').neonConfig;
  neonConfig.webSocketConstructor = ws;
  
  // Create database pool and connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return { pool };
};

const dbConnection = setupDatabase();
const pool = dbConnection?.pool;

// Set up API routes
// Product routes
app.get("/api/products", async (req, res) => {
  try {
    // Get products ordered by id
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0];
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    
    // Validate data
    if (!name || !price || !description) {
      return res.status(400).json({ message: "Name, price, and description are required" });
    }
    
    // Insert new product
    const result = await pool.query(
      'INSERT INTO products (name, price, description, image_url, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, description, imageUrl, new Date().toISOString()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.get("/api/products/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await pool.query(
      'SELECT * FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1',
      [searchQuery]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Failed to search products" });
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all other routes by serving the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  console.error(err);
  res.status(status).json({ message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});