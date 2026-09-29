import express from "express";
import { query, get } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/stats (Admin Dashboard Analytics)
router.get("/", requireAdmin, (req, res) => {
  try {
    const orderStats = get("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders");
    const totalRev = Number(orderStats.revenue) || 0;
    const productCount = get("SELECT COUNT(*) as count FROM products").count;
    const lowStockCount = get("SELECT COUNT(*) as count FROM products WHERE stock <= 10").count;
    const recentOrders = query("SELECT id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 8");

    // Order Lifecycle Stage metrics for Flowchart
    const validStages = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
    const statusRows = query(
      "SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as stage_revenue FROM orders GROUP BY status"
    );
    const orderStages = validStages.map((stage) => {
      const match = statusRows.find((r) => r.status.toLowerCase() === stage.toLowerCase());
      return {
        stage,
        count: match ? Number(match.count) : 0,
        revenue: match ? Math.round(Number(match.stage_revenue)) : 0,
      };
    });

    // Item-wise Sales breakdown
    const itemRows = query(`
      SELECT 
        p.id, 
        p.name, 
        p.category, 
        p.price, 
        p.stock, 
        p.image,
        COALESCE(SUM(oi.qty), 0) as units_sold,
        COALESCE(SUM(oi.qty * oi.price), 0) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_revenue DESC, units_sold DESC
    `);

    const itemSales = itemRows.map((item, idx) => {
      const rev = Number(item.total_revenue);
      const pct = totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : "0.0";
      return {
        id: item.id,
        rank: idx + 1,
        name: item.name,
        category: item.category,
        price: Number(item.price),
        stock: Number(item.stock),
        image: item.image,
        unitsSold: Number(item.units_sold),
        totalRevenue: Math.round(rev),
        revenuePercent: Number(pct),
      };
    });

    // Category Sales breakdown
    const catRows = query(`
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.qty), 0) as units_sold,
        COALESCE(SUM(oi.qty * oi.price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.category
      ORDER BY revenue DESC
    `);

    const categoryBreakdown = catRows.map((cat) => ({
      category: cat.category,
      productsCount: Number(cat.product_count),
      unitsSold: Number(cat.units_sold),
      revenue: Math.round(Number(cat.revenue)),
      revenuePercent: totalRev > 0 ? Number(((Number(cat.revenue) / totalRev) * 100).toFixed(1)) : 0,
    }));

    res.json({
      totalOrders: orderStats.count,
      revenue: Math.round(totalRev),
      productsCount: productCount,
      lowStockCount: lowStockCount,
      orderStages,
      itemSales,
      categoryBreakdown,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.customer_name,
        total: o.total,
        status: o.status,
        date: o.created_at,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch admin stats", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
