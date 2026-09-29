import express from "express";
import { query, run } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();
const editableKeys = new Set([
  "announcement",
  "ownerName",
  "ownerEmail",
  "ownerPhone",
  "freeDeliveryThreshold",
  "deliveryFee",
  "storeTagline",
]);

function readSettings() {
  return Object.fromEntries(
    query("SELECT key, value FROM store_settings").map(({ key, value }) => [key, JSON.parse(value)])
  );
}

router.get("/", (req, res) => {
  res.json(readSettings());
});

router.put("/", requireAdmin, (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return res.status(400).json({ error: "A settings object is required." });
  }

  const entries = Object.entries(settings);
  if (entries.some(([key]) => !editableKeys.has(key))) {
    return res.status(400).json({ error: "One or more settings are not editable." });
  }
  if (
    typeof settings.announcement !== "string" ||
    typeof settings.storeTagline !== "string" ||
    typeof settings.ownerName !== "string" ||
    typeof settings.ownerEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.ownerEmail) ||
    typeof settings.ownerPhone !== "string" ||
    !Number.isFinite(Number(settings.freeDeliveryThreshold)) ||
    Number(settings.freeDeliveryThreshold) < 0 ||
    !Number.isFinite(Number(settings.deliveryFee)) ||
    Number(settings.deliveryFee) < 0
  ) {
    return res.status(400).json({ error: "Please provide valid store contact and delivery settings." });
  }

  for (const [key, value] of entries) {
    run(
      "INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, JSON.stringify(value)]
    );
  }
  res.json(readSettings());
});

export default router;
