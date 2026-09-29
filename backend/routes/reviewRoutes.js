import express from "express";
import { query, run } from "../db.js";

const router = express.Router();

// GET /api/reviews/:productId
router.get("/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  try {
    const reviews = query(
      "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
      [productId]
    );

    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.product_id,
      name: r.user_name,
      rating: Number(r.rating),
      comment: r.comment,
      date: r.created_at,
    }));

    const count = formatted.length;
    const average = count === 0 ? 0 : formatted.reduce((sum, r) => sum + r.rating, 0) / count;

    res.json({
      reviews: formatted,
      summary: { count, average: Math.round(average * 10) / 10 },
    });
  } catch (err) {
    console.error("Failed to fetch reviews", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews/:productId
router.post("/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  const { name, rating, comment } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: "Review comment cannot be empty." });
  }

  try {
    const result = run(
      "INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)",
      [productId, name?.trim() || "Anonymous", Number(rating) || 5, comment.trim()]
    );

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      productId,
      name: name?.trim() || "Anonymous",
      rating: Number(rating) || 5,
      comment: comment.trim(),
      date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to add review", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
