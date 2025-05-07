const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const url = require('url');

// Create HTTP server
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

// Create products table if it doesn't exist
const createProductsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table created or already exists');
  } catch (err) {
    console.error('Error creating products table:', err);
  }
};

createProductsTable();

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper function to parse request body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  // API endpoints
  if (pathname === '/api/products' && req.method === 'GET') {
    // Get all products
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('Error fetching products:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  } 
  else if (pathname === '/api/products' && req.method === 'POST') {
    // Create a new product
    try {
      const body = await parseBody(req);
      const { name, price, description, imageUrl } = body;
      
      if (!name || !price || !description) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Name, price, and description are required fields' }));
        return;
      }
      
      const result = await pool.query(
        'INSERT INTO products (name, price, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, price, description, imageUrl]
      );
      
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      console.error('Error creating product:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
  else if (pathname.startsWith('/api/products/search') && req.method === 'GET') {
    // Search products
    try {
      const queryParams = new URLSearchParams(parsedUrl.search);
      const query = queryParams.get('query');
      
      if (!query) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Search query is required' }));
        return;
      }
      
      const result = await pool.query(
        'SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1',
        [`%${query}%`]
      );
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('Error searching products:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
  else if (pathname.match(/^\/api\/products\/\d+$/) && req.method === 'DELETE') {
    // Delete a product
    try {
      // Extract the product ID from the URL
      const productId = pathname.split('/').pop();
      
      if (!productId || isNaN(parseInt(productId))) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid product ID' }));
        return;
      }
      
      // Delete the product from the database
      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [productId]
      );
      
      if (result.rows.length === 0) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Product not found' }));
        return;
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Product deleted successfully', product: result.rows[0] }));
    } catch (err) {
      console.error('Error deleting product:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
  else {
    // Serve static files
    let filePath = pathname;
    
    // Default to index.html
    if (filePath === '/') {
      filePath = '/index.html';
    }
    
    // Add public directory prefix
    filePath = path.join(process.cwd(), 'public', filePath);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // File not found
          fs.readFile(path.join(process.cwd(), 'public', 'index.html'), (err, content) => {
            if (err) {
              res.statusCode = 500;
              res.end('Server Error');
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(content, 'utf-8');
            }
          });
        } else {
          // Server error
          res.statusCode = 500;
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        // Success
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(content, 'utf-8');
      }
    });
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});