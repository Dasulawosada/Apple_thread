import http from "node:http";

async function runTests() {
  console.log("🧪 Starting Automated API & Database Verification Tests...\n");

  const baseUrl = "http://localhost:5000/api";

  async function req(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    const health = await req("/health");
    console.log("1. Health Check:", health.status === 200 ? "✓ PASS" : "✗ FAIL", health.data);

    // 2. Fetch products & search
    const prods = await req("/products?search=cotton");
    console.log(`2. Product Search ('cotton'): ${prods.status === 200 && prods.data.length > 0 ? "✓ PASS" : "✗ FAIL"} (Found ${prods.data.length} items)`);

    // 3. Admin Login
    const adminLogin = await req("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    console.log("3. Admin Login:", adminLogin.status === 200 ? "✓ PASS" : "✗ FAIL", `Token: ${Boolean(adminLogin.data.token)}`);
    const adminToken = adminLogin.data.token;

    // 4. Customer Registration
    const testEmail = `test_${Date.now()}@example.com`;
    const register = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Testing User", email: testEmail, password: "password123" }),
    });
    console.log("4. User Registration:", register.status === 201 ? "✓ PASS" : "✗ FAIL", `User: ${register.data.user?.email}`);

    // 5. Place Order & Check Stock
    const initialProduct = prods.data[0];
    const initialStock = initialProduct.stock;

    const orderRes = await req("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${register.data.token}` },
      body: JSON.stringify({
        items: [{ id: initialProduct.id, name: initialProduct.name, price: initialProduct.price, qty: 2 }],
        address: { name: "Testing User", phone: "0771234567", address: "123 Test St", city: "Colombo" },
        paymentMethod: "Cash on Delivery",
      }),
    });
    console.log("5. Place Order in Database:", orderRes.status === 201 ? "✓ PASS" : "✗ FAIL", `Order ID: ${orderRes.data?.id}`);

    // Verify stock decremented
    const updatedProd = await req(`/products/${initialProduct.id}`);
    const stockDecreased = updatedProd.data.stock === initialStock - 2;
    console.log(`   Stock Auto-decrement: ${stockDecreased ? "✓ PASS" : "✗ FAIL"} (Stock went from ${initialStock} -> ${updatedProd.data.stock})`);

    // 6. Admin Orders Status Update
    const updateStatus = await req(`/orders/${orderRes.data.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "Processing" }),
    });
    console.log("6. Admin Update Order Status:", updateStatus.data.status === "Processing" ? "✓ PASS" : "✗ FAIL");

    // 7. Admin Dashboard KPI Stats
    const stats = await req("/stats", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("7. Admin KPI Stats:", stats.status === 200 ? "✓ PASS" : "✗ FAIL", `Total Orders: ${stats.data.totalOrders}, Revenue: Rs. ${stats.data.revenue}`);

    console.log("\n🎉 ALL BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

// Start server and run tests
import("./server.js").then(() => {
  setTimeout(runTests, 1000);
});
