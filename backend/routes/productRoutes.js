import express from "express";
import { query, get, run } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Helper to normalize product row
function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    stock: Number(p.stock),
    description: p.description || "",
    image: p.image || "",
    createdAt: p.created_at,
  };
}

// GET /api/products
router.get("/", (req, res) => {
  const { search, category, minPrice, maxPrice, inStock, onSale, sort } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    params.push(term, term, term);
  }

  if (category && category.trim() && category !== "All") {
    sql += " AND category = ?";
    params.push(category.trim());
  }

  if (minPrice) {
    sql += " AND price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    sql += " AND price <= ?";
    params.push(Number(maxPrice));
  }

  if (inStock === "true" || inStock === true) {
    sql += " AND stock > 0";
  }

  if (onSale === "true" || onSale === true) {
    sql += " AND old_price > price";
  }

  if (sort === "low") {
    sql += " ORDER BY price ASC";
  } else if (sort === "high") {
    sql += " ORDER BY price DESC";
  } else {
    sql += " ORDER BY id DESC";
  }

  try {
    const rows = query(sql, params);
    res.json(rows.map(formatProduct));
  } catch (err) {
    console.error("Failed to fetch products", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const p = get("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!p) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(formatProduct(p));
});

// POST /api/products (Admin)
router.post("/", requireAdmin, (req, res) => {
  const { name, category, price, oldPrice, stock, description, image } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: "Name, category, and price are required." });
  }

  try {
    const result = run(
      `INSERT INTO products (name, category, price, old_price, stock, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category.trim(),
        Number(price) || 0,
        oldPrice ? Number(oldPrice) : null,
        Number(stock) || 0,
        description?.trim() || "",
        image?.trim() || "",
      ]
    );

    const inserted = get("SELECT * FROM products WHERE id = ?", [result.lastInsertRowid]);
    res.status(201).json(formatProduct(inserted));
  } catch (err) {
    console.error("Failed to create product", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id (Admin)
router.put("/:id", requireAdmin, (req, res) => {
  const { name, category, price, oldPrice, stock, description, image } = req.body;
  const productId = req.params.id;

  const existing = get("SELECT id FROM products WHERE id = ?", [productId]);
  if (!existing) {
    return res.status(404).json({ error: "Product not found." });
  }

  try {
    run(
      `UPDATE products 
       SET name = ?, category = ?, price = ?, old_price = ?, stock = ?, description = ?, image = ?
       WHERE id = ?`,
      [
        name?.trim(),
        category?.trim(),
        Number(price) || 0,
        oldPrice ? Number(oldPrice) : null,
        Number(stock) || 0,
        description?.trim() || "",
        image?.trim() || "",
        productId,
      ]
    );

    const updated = get("SELECT * FROM products WHERE id = ?", [productId]);
    res.json(formatProduct(updated));
  } catch (err) {
    console.error("Failed to update product", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id (Admin)
router.delete("/:id", requireAdmin, (req, res) => {
  const productId = req.params.id;
  const existing = get("SELECT id FROM products WHERE id = ?", [productId]);
  if (!existing) {
    return res.status(404).json({ error: "Product not found." });
  }

  try {
    run("DELETE FROM products WHERE id = ?", [productId]);
    res.json({ message: "Product deleted successfully", id: Number(productId) });
  } catch (err) {
    console.error("Failed to delete product", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
