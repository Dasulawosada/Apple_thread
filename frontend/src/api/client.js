const API_BASE = "http://localhost:5000/api";
export const SERVER_URL = "http://localhost:5000";

// Helper to resolve image paths (Unsplash, local uploads, or external URLs)
export function getImageUrl(url) {
  if (!url) return "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=700&auto=format&fit=crop&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${SERVER_URL}${url}`;
  }
  return `${SERVER_URL}/uploads/${url}`;
}

function getAuthHeader() {
  const token = localStorage.getItem("apple-thread-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/products${qs}`);
  },

  async getProduct(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Image Upload (Multer)
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("apple-thread-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }
    return data.imageUrl;
  },

  // Authentication
  async register(name, email, password) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async adminLogin(username, password) {
    return request("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  async googleLogin(userData) {
    return request("/auth/google", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getMe() {
    return request("/auth/me");
  },

  async updateMe(profile) {
    return request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },

  async getSettings() {
    return request("/settings");
  },

  async updateSettings(settings) {
    return request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  // Orders
  async createOrder(orderData) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(email) {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    return request(`/orders${qs}`);
  },

  async getOrder(id) {
    return request(`/orders/${id}`);
  },

  async updateOrderStatus(id, status) {
    return request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Reviews
  async getReviews(productId) {
    return request(`/reviews/${productId}`);
  },

  async addReview(productId, reviewData) {
    return request(`/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  // Stats (Admin)
  async getStats() {
    return request("/stats");
  },

  // Contact
  async sendContact(contactData) {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
    });
  },
};
