// Import required modules in ES module format
import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
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
const setupDatabase = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Did you forget to provision a database?");
    return null;
  }
  
  // Create database pool and connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return { pool };
};

const dbConnection = setupDatabase();
const pool = dbConnection?.pool;

// API Routes
// Get all products
app.get("/api/products", async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" });
    }

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
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" });
    }

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
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" });
    }

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
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" });
    }

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
  console.log(`Express.js server running on port ${PORT}`);
});