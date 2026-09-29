import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminShell from "./AdminShell";
import { useProducts } from "../../context/ProductsContext";
import { api, getImageUrl } from "../../api/client";
import "../../App.css";

const CATEGORY_OPTIONS = ["Sewing", "Embroidery", "Industrial", "Accessories"];

function AdminAddProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { getProduct, addProduct, updateProduct } = useProducts();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: CATEGORY_OPTIONS[0],
    description: "",
    price: "",
    oldPrice: "",
    stock: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const existing = getProduct(id);
      if (existing) {
        setForm(existing);
        if (existing.image) {
          setImagePreview(getImageUrl(existing.image));
        }
      }
    }
  }, [id, isEdit, getProduct]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let finalImageUrl = form.image;

      // If user selected a new file from their device, upload it to the server
      if (imageFile) {
        finalImageUrl = await api.uploadImage(imageFile);
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price) || 0,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stock: Number(form.stock) || 0,
        image: finalImageUrl || "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=700&auto=format&fit=crop&q=80",
      };

      if (isEdit) {
        await updateProduct(Number(id), payload);
      } else {
        await addProduct(payload);
      }

      setSaved(true);
      setTimeout(() => navigate("/admin/products"), 800);
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(err.message || "Failed to save product to database.");
      setSaving(false);
    }
  }

  return (
    <AdminShell active="add" title={isEdit ? "Edit Product" : "Add New Product"}>
      {error && (
        <div style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="admin-form-main">
          <span className="label">Product Name *</span>
          <input
            className="input-plain"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Silk Embroidery Thread 100m"
          />

          <span className="label">Description</span>
          <textarea
            className="input-plain"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="High-grade thread details, material composition, use cases..."
          />

          <div className="row">
            <div className="col">
              <span className="label">Category *</span>
              <select className="input-plain" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col">
              <span className="label">Stock Quantity *</span>
              <input
                className="input-plain"
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <span className="label">Price (Rs.) *</span>
              <input
                className="input-plain"
                type="number"
                min="0"
                step="any"
                required
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="490.00"
              />
            </div>
            <div className="col">
              <span className="label">Old Price (Rs., optional discount)</span>
              <input
                className="input-plain"
                type="number"
                min="0"
                step="any"
                value={form.oldPrice || ""}
                onChange={(e) => update("oldPrice", e.target.value)}
                placeholder="600.00"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              className="modern-add-cart"
              type="submit"
              disabled={saving}
              style={{ minWidth: 160 }}
            >
              {saved ? "Saved to Database ✓" : saving ? "Uploading & Saving..." : isEdit ? "Save Changes" : "Save to Database"}
            </button>
            <button
              type="button"
              className="btn-outline-sm"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="admin-form-image">
          <span className="label">Product Photo (Saved to Server / Database)</span>
          <label className="image-drop">
            {imagePreview ? (
              <img src={imagePreview} alt="Product preview" />
            ) : (
              <span>
                📁 Click here to select an image<br />
                <small style={{ color: "#888", fontSize: 11, marginTop: 6, display: "block" }}>
                  (JPG, PNG, WEBP — automatically uploaded to server)
                </small>
              </span>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
          {imagePreview && (
            <p style={{ fontSize: 11, color: "#666", textAlign: "center", marginTop: 8 }}>
              Click on the preview to choose a different photo
            </p>
          )}
        </div>
      </form>
    </AdminShell>
  );
}

export default AdminAddProduct;
