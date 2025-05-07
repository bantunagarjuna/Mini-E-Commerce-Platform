# Database Schema Details

## Products Table Schema

Below is the detailed schema information for the `products` table in the PostgreSQL database:

| Column Name | Data Type | Max Length | Default Value | Nullable |
|-------------|-----------|------------|---------------|----------|
| id | integer | null | nextval('products_id_seq'::regclass) | NO |
| name | text | null | null | NO |
| price | double precision | null | null | NO |
| description | text | null | null | NO |
| image_url | text | null | null | YES |
| created_at | text | null | '2025-05-07T03:54:52.018Z'::text | NO |

## Schema Explanation

- **id**: Auto-incrementing primary key for each product entry
- **name**: The product name (required)
- **price**: The product price stored as a double precision number (required)
- **description**: Detailed product description (required)
- **image_url**: URL to the product image (optional)
- **created_at**: Timestamp when the product was added to the database (automatically set)

## Database Queries

### Select All Products
```sql
SELECT * FROM products;
```

### Add New Product
```sql
INSERT INTO products (name, price, description, image_url)
VALUES ('Product Name', 99.99, 'Product Description', 'https://example.com/image.jpg');
```

### Delete Product
```sql
DELETE FROM products WHERE id = 1;
```

### Search Products by Name or Description
```sql
SELECT * FROM products 
WHERE name ILIKE '%search_term%' OR description ILIKE '%search_term%';
```