import express from "express";
import { query, run } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/contact - Submit contact form inquiry
router.post("/", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  try {
    const result = run(
      "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim(), subject?.trim() || "General Inquiry", message.trim()]
    );

    res.status(201).json({
      message: "Message received successfully",
      id: Number(result.lastInsertRowid),
    });
  } catch (err) {
    console.error("Failed to save contact message", err);
    res.status(500).json({ error: "Failed to submit message." });
  }
});

// GET /api/contact (Admin)
router.get("/", requireAdmin, (req, res) => {
  try {
    const contacts = query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact inquiries." });
  }
});

export default router;
