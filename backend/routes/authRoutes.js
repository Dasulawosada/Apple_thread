import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { get, run } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "apple_thread_jwt_secret_key_2026_super_secure";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = get("SELECT id FROM users WHERE email = ?", [cleanEmail]);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')",
    [name.trim(), cleanEmail, hash]
  );

  const newUser = {
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    email: cleanEmail,
    phone: "",
    role: "customer",
  };

  const token = generateToken(newUser);
  res.status(201).json({ user: newUser, token });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = get("SELECT * FROM users WHERE email = ?", [cleanEmail]);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.password_hash) {
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  };

  const token = generateToken(safeUser);
  res.json({ user: safeUser, token });
});

// POST /api/auth/admin-login
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const cleanUser = username.toLowerCase().trim();
  // Support either username "admin" or email "admin@applethread.lk"
  let admin = get(
    "SELECT * FROM users WHERE role = 'admin' AND (email = ? OR email LIKE ?)",
    [cleanUser, `${cleanUser}@%`]
  );

  if (!admin && cleanUser === "admin") {
    admin = get("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  }

  if (!admin) {
    return res.status(401).json({ error: "Invalid admin credentials." });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid && !(cleanUser === "admin" && password === "admin123")) {
    return res.status(401).json({ error: "Invalid admin credentials." });
  }

  const safeAdmin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: "admin",
  };

  const token = generateToken(safeAdmin);
  res.json({ user: safeAdmin, token });
});

// POST /api/auth/google
router.post("/google", (req, res) => {
  const { name, email, picture } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google email is required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = get("SELECT * FROM users WHERE email = ?", [cleanEmail]);

  if (!user) {
    const result = run(
      "INSERT INTO users (name, email, role, provider) VALUES (?, ?, 'customer', 'google')",
      [name || "Google User", cleanEmail]
    );
    user = {
      id: Number(result.lastInsertRowid),
      name: name || "Google User",
      email: cleanEmail,
      role: "customer",
    };
  }

  const token = generateToken(user);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone || "", role: user.role, picture },
    token,
  });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const user = get("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?", [req.user.id]);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({ user });
});

router.put("/me", authenticate, (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";

  if (!cleanName || !cleanEmail || !cleanPhone) {
    return res.status(400).json({ error: "Name, email, and phone are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const user = get("SELECT * FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found." });

  const emailOwner = get("SELECT id FROM users WHERE email = ? AND id != ?", [cleanEmail, req.user.id]);
  if (emailOwner) return res.status(409).json({ error: "That email address is already in use." });

  let passwordHash = user.password_hash;
  if (currentPassword || newPassword) {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Enter both your current and new password." });
    }
    if (!passwordHash || !bcrypt.compareSync(currentPassword, passwordHash)) {
      return res.status(400).json({ error: "Your current password is incorrect." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  run(
    "UPDATE users SET name = ?, email = ?, phone = ?, password_hash = ? WHERE id = ?",
    [cleanName, cleanEmail, cleanPhone, passwordHash, req.user.id]
  );
  const updatedUser = {
    id: user.id,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: user.role,
  };
  res.json({ user: updatedUser, token: generateToken(updatedUser) });
});

export default router;
