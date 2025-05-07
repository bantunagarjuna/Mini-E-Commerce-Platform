import { users, type User, type InsertUser, products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq, like, or } from "drizzle-orm";

// Extend storage interface with product-related methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    const productList = await db.select().from(products).orderBy(products.id);
    return productList;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [createdProduct] = await db
      .insert(products)
      .values({ ...product, createdAt: new Date().toISOString() })
      .returning();
    return createdProduct;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name.toLowerCase(), searchQuery),
          like(products.description.toLowerCase(), searchQuery)
        )
      );
    return result;
  }
}

export const storage = new DatabaseStorage();
