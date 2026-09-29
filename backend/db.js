import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, "apple_thread.db");
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and performance
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Initialize Database Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      password_hash TEXT,
      role TEXT DEFAULT 'customer',
      provider TEXT DEFAULT 'local',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      old_price REAL,
      stock INTEGER DEFAULT 0,
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal TEXT,
      payment_method TEXT DEFAULT 'Cash on Delivery',
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      qty INTEGER NOT NULL,
      image TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  if (!userColumns.some((column) => column.name === "phone")) {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''");
  }

  const defaultSettings = {
    announcement: "🧵 Free delivery on orders over Rs. 2,500 across Sri Lanka",
    ownerName: "Thenuwara Hannadige",
    ownerEmail: "Wosadasula2004@gmail.com",
    ownerPhone: "071-0835022",
    freeDeliveryThreshold: 2500,
    deliveryFee: 250,
    storeTagline: "Sri Lanka's Premium Quality Thread Supplier",
  };
  const insertSetting = db.prepare("INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, JSON.stringify(value));
  }

  seedData();
}

function seedData() {
  // 1. Seed Admin & Test User if not exists
  const countUsers = db.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  if (countUsers === 0) {
    const adminPassHash = bcrypt.hashSync("admin123", 10);
    const userPassHash = bcrypt.hashSync("user123", 10);

    const insertUser = db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    );
    insertUser.run("Administrator", "admin@applethread.lk", adminPassHash, "admin");
    insertUser.run("Nimal Perera", "customer@applethread.lk", userPassHash, "customer");
    console.log("✓ Seeded default admin (admin@applethread.lk / admin123) and customer account.");
  }

  // 2. Seed Products if catalog is empty
  const countProducts = db.prepare("SELECT COUNT(*) as cnt FROM products").get().cnt;
  if (countProducts === 0) {
    const starterProducts = [
      {
        name: "Cotton Sewing Thread 250m",
        category: "Sewing",
        price: 490,
        old_price: 600,
        stock: 120,
        description: "High-quality cotton sewing thread, colour-fast and strong. Great for everyday sewing and light garment work.",
        image: "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=700&auto=format&fit=crop&q=80",
      },
      {
        name: "Silk Embroidery Thread",
        category: "Embroidery",
        price: 688,
        old_price: 850,
        stock: 45,
        description: "Smooth silk embroidery thread with a beautiful sheen, ideal for decorative stitching and detail work.",
        image: "https://images.unsplash.com/photo-1588618777461-81fe15d547be?w=700&auto=format&fit=crop&q=80",
      },
      {
        name: "Polyester Thread Set",
        category: "Sewing",
        price: 950,
        old_price: 1200,
        stock: 60,
        description: "A multi-colour polyester thread set built for durability, perfect for machine sewing projects.",
        image: "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=700&auto=format&fit=crop&q=80",
      },
      {
        name: "Industrial Nylon Thread",
        category: "Industrial",
        price: 937,
        old_price: 1100,
        stock: 30,
        description: "Heavy-duty nylon thread designed for industrial and upholstery sewing machines.",
        image: "https://images.unsplash.com/photo-1588618777461-81fe15d547be?w=700&auto=format&fit=crop&q=80",
      },
      {
        name: "Gold Metallic Thread Cones",
        category: "Embroidery",
        price: 1250,
        old_price: 1500,
        stock: 25,
        description: "Gleaming metallic embroidery thread for high-end saree borders, dress embroidery, and festive crafts.",
        image: "https://images.unsplash.com/photo-1588618777461-81fe15d547be?w=700&auto=format&fit=crop&q=80",
      },
      {
        name: "Tailoring Snips & Thread Cutter",
        category: "Accessories",
        price: 350,
        old_price: 450,
        stock: 80,
        description: "Sharp spring-action thread scissors perfect for clean thread snipping and seam trimming.",
        image: "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=700&auto=format&fit=crop&q=80",
      }
    ];

    const insertProd = db.prepare(
      "INSERT INTO products (name, category, price, old_price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of starterProducts) {
      insertProd.run(p.name, p.category, p.price, p.old_price, p.stock, p.description, p.image);
    }
    console.log("✓ Seeded starter thread products.");
  }

  // 3. Seed Reviews if empty
  const countReviews = db.prepare("SELECT COUNT(*) as cnt FROM reviews").get().cnt;
  if (countReviews === 0) {
    const insertReview = db.prepare(
      "INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)"
    );
    insertReview.run(1, "Kamal Silva", 5, "Strong thread, colors don't bleed even after multiple washes.");
    insertReview.run(1, "Anoma Dissanayake", 4, "Good quality, fast delivery to Kandy.");
    insertReview.run(2, "Sachini Perera", 5, "Beautiful sheen for hand embroidery on silk sarees.");
    console.log("✓ Seeded sample customer reviews.");
  }
}

// Database helper functions
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}
