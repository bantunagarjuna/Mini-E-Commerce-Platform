// Setup database schema for Express.js version
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon database
neonConfig.webSocketConstructor = ws;

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Did you forget to provision a database?");
    return;
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
      console.log("Database tables already exist. No setup needed.");
    }
    
    await pool.end();
    console.log("Database connection closed.");
    
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

// Run the setup function
setupDatabase();