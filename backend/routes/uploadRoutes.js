import express from "express";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  // Construct URL accessible from client
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: "Image uploaded successfully",
    imageUrl,
    filename: req.file.filename,
  });
});

export default router;
