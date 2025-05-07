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
  else if (pathname === '/database-view') {
    // Display database entries in a visual format
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      const products = result.rows;
      
      // Generate HTML for the database view
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Entries - Mini E-Commerce Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f7fa;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        .table-container {
            overflow-x: auto;
        }
        h1 {
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .product-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
        tr:hover {
            background-color: #f9fafb;
        }
        .footer {
            margin-top: 1.5rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold mb-6">Database Entries - Mini E-Commerce Platform</h1>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.image_url ? `<img src="${product.image_url}?w=60&h=60&fit=crop" alt="${product.name}" class="product-img">` : 'No Image'}</td>
                        <td>${product.name}</td>
                        <td>$${product.price}</td>
                        <td>${product.description}</td>
                        <td>${new Date(product.created_at).toLocaleDateString()}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">Database Schema</h2>
            <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto">
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
            </pre>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Mini E-Commerce Platform. Created by <span style="background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 500;">Bantu Nagajuna</span></p>
        </div>
    </div>
</body>
</html>`;
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    } catch (err) {
      console.error('Error generating database view:', err);
      res.statusCode = 500;
      res.end('Server Error');
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