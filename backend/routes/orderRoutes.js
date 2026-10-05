import express from "express";
import crypto from "node:crypto";
import { query, get, run, db } from "../db.js";
import { optionalAuthenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function getStoreSettings() {
  const rows = query("SELECT key, value FROM store_settings");
  return Object.fromEntries(rows.map(({ key, value }) => [key, JSON.parse(value)]));
}

function getOrderItems(orderId) {
  const items = query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
  return items.map((i) => ({
    id: i.product_id,
    name: i.product_name,
    price: Number(i.price),
    qty: Number(i.qty),
    image: i.image,
  }));
}

function formatOrder(o) {
  return {
    id: o.id,
    userId: o.user_id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    phone: o.phone,
    address: {
      name: o.customer_name,
      phone: o.phone,
      address: o.address,
      city: o.city,
      postal: o.postal,
    },
    paymentMethod: o.payment_method,
    subtotal: Number(o.subtotal),
    delivery: Number(o.delivery_fee),
    total: Number(o.total),
    status: o.status,
    date: o.created_at,
    items: getOrderItems(o.id),
  };
}

// POST /api/orders - Create a new order
router.post("/", optionalAuthenticate, (req, res) => {
  const { items, address, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart cannot be empty when ordering." });
  }

  if (!address || !address.name || !address.phone || !address.address || !address.city) {
    return res.status(400).json({ error: "Complete delivery address is required." });
  }

  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty)), 0);
  const settings = getStoreSettings();
  const threshold = Number(settings.freeDeliveryThreshold ?? 2500);
  const deliveryFee = Number(settings.deliveryFee ?? 250);
  const delivery = subtotal >= threshold ? 0 : deliveryFee;
  const total = subtotal + delivery;
  const orderId = "AT-" + Math.floor(10000 + Math.random() * 89999);
  const userId = req.user ? req.user.id : null;
  const customerEmail = req.user?.email || req.body.email || "";

  try {
    db.exec("BEGIN TRANSACTION;");

    const initialStatus = paymentMethod === "PayHere" ? "Pending Payment" : "Confirmed";

    run(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, address, city, postal, payment_method, subtotal, delivery_fee, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        address.name.trim(),
        customerEmail.trim(),
        address.phone.trim(),
        address.address.trim(),
        address.city.trim(),
        address.postal?.trim() || "",
        paymentMethod || "Cash on Delivery",
        subtotal,
        delivery,
        total,
        initialStatus,
      ]
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, price, qty, image)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const updateStock = db.prepare(
      `UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`
    );

    for (const item of items) {
      insertItem.run(
        orderId,
        item.id || null,
        item.name,
        Number(item.price),
        Number(item.qty),
        item.image || ""
      );

      if (item.id) {
        updateStock.run(Number(item.qty), item.id);
      }
    }

    db.exec("COMMIT;");

    const created = get("SELECT * FROM orders WHERE id = ?", [orderId]);
    const formatted = formatOrder(created);

    if (paymentMethod === "PayHere") {
      const merchantId = process.env.PAYHERE_MERCHANT_ID || "1238361";
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "OTA0NDc2MTQwMjczMTY3MzU0NzEzMDU4NDk3MzM3NTg5NzczNzY=";
      const formattedAmount = Number(total).toFixed(2);
      const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
      const hash = crypto
        .createHash("md5")
        .update(merchantId + orderId + formattedAmount + "LKR" + hashedSecret)
        .digest("hex")
        .toUpperCase();

      formatted.payhere = {
        merchantId,
        orderId,
        amount: formattedAmount,
        currency: "LKR",
        hash,
      };
    }

    res.status(201).json(formatted);
  } catch (err) {
    db.exec("ROLLBACK;");
    console.error("Failed to place order", err);
    res.status(500).json({ error: "Failed to place order." });
  }
});

// GET /api/orders - Get orders (customer sees theirs, admin sees all)
router.get("/", optionalAuthenticate, (req, res) => {
  try {
    let orders = [];
    if (req.user && req.user.role === "admin") {
      orders = query("SELECT * FROM orders ORDER BY created_at DESC");
    } else if (req.user) {
      orders = query(
        "SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC",
        [req.user.id, req.user.email]
      );
    } else if (req.query.email) {
      orders = query(
        "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC",
        [req.query.email]
      );
    } else {
      // Guest with no authentication and no email filter should see an empty list
      orders = [];
    }

    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const o = get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!o) {
    return res.status(404).json({ error: "Order not found." });
  }
  res.json(formatOrder(o));
});

// PATCH /api/orders/:id/status (Admin)
router.patch("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending Payment", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const existing = get("SELECT id FROM orders WHERE id = ?", [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: "Order not found." });
  }

  try {
    run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    const updated = get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json(formatOrder(updated));
  } catch (err) {
    console.error("Failed to update order status", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

// POST /api/orders/payhere-hash - Generate MD5 hash for PayHere payment
router.post("/payhere-hash", (req, res) => {
  const { orderId, amount, currency = "LKR" } = req.body;
  if (!orderId || amount === undefined || amount === null) {
    return res.status(400).json({ error: "orderId and amount are required" });
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID || "1238361";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "OTA0NDc2MTQwMjczMTY3MzU0NzEzMDU4NDk3MzM3NTg5NzczNzY=";
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hash = crypto
    .createHash("md5")
    .update(merchantId + orderId + formattedAmount + currency + hashedSecret)
    .digest("hex")
    .toUpperCase();

  res.json({
    merchantId,
    orderId,
    amount: formattedAmount,
    currency,
    hash,
  });
});

// POST /api/orders/:id/confirm-payment - Confirm successful PayHere payment
router.post("/:id/confirm-payment", (req, res) => {
  const existing = get("SELECT id FROM orders WHERE id = ?", [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: "Order not found." });
  }

  try {
    run("UPDATE orders SET status = 'Confirmed' WHERE id = ?", [req.params.id]);
    const updated = get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json(formatOrder(updated));
  } catch (err) {
    console.error("Failed to confirm order payment", err);
    res.status(500).json({ error: "Failed to confirm payment." });
  }
});

// POST /api/orders/payhere-notify - PayHere IPN Webhook
router.post("/payhere-notify", (req, res) => {
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "OTA0NDc2MTQwMjczMTY3MzU0NzEzMDU4NDk3MzM3NTg5NzczNzY=";
  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const localMd5sig = crypto
    .createHash("md5")
    .update(
      (merchant_id || "") +
      (order_id || "") +
      (payhere_amount || "") +
      (payhere_currency || "") +
      (status_code || "") +
      hashedSecret
    )
    .digest("hex")
    .toUpperCase();

  if (localMd5sig === md5sig) {
    if (Number(status_code) === 2) {
      run("UPDATE orders SET status = 'Confirmed' WHERE id = ?", [order_id]);
      console.log(`[PayHere IPN] Payment verified for Order ${order_id} (Payment ID: ${payment_id})`);
    } else {
      console.log(`[PayHere IPN] Status ${status_code} received for Order ${order_id}`);
    }
  } else {
    console.warn(`[PayHere IPN] Invalid signature for Order ${order_id}`);
  }

  res.sendStatus(200);
});

export default router;
