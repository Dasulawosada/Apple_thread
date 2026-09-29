import { useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "./AdminShell";
import { useProducts } from "../../context/ProductsContext";
import "../../App.css";

function AdminProducts() {
  const { products, deleteProduct, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id, name) {
    if (window.confirm(`Delete product "${name}" from the database? This cannot be undone.`)) {
      try {
        setDeletingId(id);
        await deleteProduct(id);
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      } finally {
        setDeletingId(null);
      }
    }
  }

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      String(p.id).includes(term)
    );
  });

  return (
    <AdminShell active="products" title="Products Management">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 14, flexWrap: "wrap" }}>
        <input
          className="input-plain"
          placeholder="Search products by name, category, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Link to="/admin/products/new" className="modern-add-cart" style={{ textDecoration: "none", padding: "10px 20px" }}>
          + Add New Product
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "#888", padding: "20px 0" }}>Loading products from database...</p>
      ) : filteredProducts.length === 0 ? (
        <div style={{ background: "white", padding: 30, borderRadius: 8, textAlign: "center", border: "1px solid #eee" }}>
          <p style={{ color: "#888", margin: 0 }}>
            {searchTerm ? `No products match "${searchTerm}"` : "No products found in the database. Click '+ Add New Product' to add one."}
          </p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #eee", overflowX: "auto" }}>
          <table className="wf-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6, background: "#f5f5f5" }}
                    />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: 11, color: "#888" }}>ID: #{p.id}</div>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <strong>Rs. {p.price}</strong>
                    {p.oldPrice && <del style={{ fontSize: 11, color: "#999", marginLeft: 6 }}>Rs. {p.oldPrice}</del>}
                  </td>
                  <td><strong>{p.stock}</strong></td>
                  <td>
                    <span className={`pill ${p.stock === 0 ? "pill-danger" : p.stock <= 10 ? "pill-warning" : "pill-success"}`}>
                      {p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <Link to={`/admin/products/${p.id}/edit`} className="btn-outline-sm">
                        Edit
                      </Link>
                      <button
                        className="btn-outline-sm"
                        style={{ color: "#B23A48", borderColor: "#f1c2c8" }}
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminProducts;
