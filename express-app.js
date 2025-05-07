#!/usr/bin/env node

// Combined script for database setup and Express.js server
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Neon database
neonConfig.webSocketConstructor = ws;

// Create Express application
const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Database setup
async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Did you forget to provision a database?");
    return null;
  }
  
  try {
    // Create database pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    const tablesExist = tableCheck.rows[0].exists;
    
    if (!tablesExist) {
      console.log("Creating products table...");
      
      // Create products table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log("Products table created successfully!");
      
      // Insert sample products
      console.log("Inserting sample products...");
      await pool.query(`
        INSERT INTO products (name, price, description, image_url, created_at)
        VALUES 
          ('Office Chair', 199.99, 'Ergonomic office chair with lumbar support and adjustable armrests.', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', CURRENT_TIMESTAMP),
          ('Wooden Desk', 349.99, 'Solid wood desk with drawer storage perfect for home office.', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd', CURRENT_TIMESTAMP),
          ('Table Lamp', 59.99, 'Modern desk lamp with adjustable brightness and color temperature.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', CURRENT_TIMESTAMP),
          ('Bookshelf', 129.99, 'Five-tier bookshelf with ample storage for books and decorative items.', 'https://images.unsplash.com/photo-1594620302200-9a762244a156', CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;
      `);
      
      console.log("Sample products inserted successfully!");
    } else {
      console.log("Database tables already exist.");
    }
    
    return pool;
  } catch (error) {
    console.error("Error setting up database:", error);
    return null;
  }
}

// Start the application
async function startApp() {
  console.log("Setting up database...");
  const pool = await setupDatabase();
  
  if (!pool) {
    console.error("Failed to set up database. Exiting...");
    process.exit(1);
  }
  
  // API Routes
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  // Get a specific product by ID
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
  
  // Create a new product
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
        [name, price, description, imageUrl || null, new Date().toISOString()]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Search products
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
  
  // Handle all other routes by serving the main HTML file with React
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-react.html'));
  });
  
  // For compatibility with vanilla JS version
  app.get('/vanilla', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  // Fallback route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-react.html'));
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    res.status(status).json({ message });
  });
  
  // Start the server on a different port than the TypeScript app
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express.js server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
  });
}

// Start the application
startApp();