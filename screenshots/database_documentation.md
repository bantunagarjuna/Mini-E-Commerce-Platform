# Database Documentation

## Database Schema

The Mini E-Commerce Platform uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Current Database Entries

Below is a snapshot of the products table as of May 7, 2025:

| ID | Name | Price | Description | Image URL | Created At |
|----|------|-------|-------------|-----------|------------|
| 4 | Wireless Bluetooth Headphones | $59.99 | Premium noise-cancelling headphones with deep bass and crystal clear sound. 30-hour battery life and comfortable over-ear design. | [View Image](https://images.unsplash.com/photo-1505740420928-5e560c06d30e) | 2025-05-07 |
| 5 | Smart Fitness Watch | $89.99 | Track your health and fitness with this advanced smartwatch. Features heart rate monitoring, step counting, sleep tracking, and smartphone notifications. | [View Image](https://images.unsplash.com/photo-1579586337278-3befd40fd17a) | 2025-05-07 |
| 6 | Portable Bluetooth Speaker | $49.99 | Compact, waterproof speaker with amazing 360-degree sound. Perfect for outdoor adventures with 12-hour battery life and durable construction. | [View Image](https://images.unsplash.com/photo-1608043152269-423dbba4e7e1) | 2025-05-07 |
| 7 | Ultra HD Smart TV | $699.99 | 55-inch 4K Ultra HD Smart TV with built-in streaming apps, voice control, and stunning picture quality. Experience your favorite content like never before. | [View Image](https://images.unsplash.com/photo-1593359677879-a4bb92f829d1) | 2025-05-07 |

## Product Images

### Wireless Bluetooth Headphones
![Headphones](https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop)

### Smart Fitness Watch
![Fitness Watch](https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=200&fit=crop)

### Portable Bluetooth Speaker
![Bluetooth Speaker](https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop)

### Ultra HD Smart TV
![Smart TV](https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop)