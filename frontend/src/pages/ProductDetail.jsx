import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useReviews } from "../context/ReviewsContext";
import { useAuth } from "../context/AuthContext";
import BackButton from "../BackButton";

function Stars({ value }) {
  const rounded = Math.round(value);
  return (
    <span className="star-display">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "star-on" : "star-off"}>★</span>
      ))}
    </span>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const { addReview } = useReviews();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a short comment about the product.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await addReview(productId, { name, rating, comment });
      setComment("");
      onSubmitted?.();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      <div className="review-form-row">
        <div className="col">
          <span className="label">Your Name</span>
          <input
            className="input-plain"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nimal Perera"
          />
        </div>
        <div className="col">
          <span className="label">Rating</span>
          <select className="input-plain" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Star" : "Stars"}</option>
            ))}
          </select>
        </div>
      </div>

      <span className="label">Your Review</span>
      <textarea
        className="input-plain"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this thread or accessory..."
      />
      {error && <p style={{ color: "#B23A48", fontSize: 13, marginTop: 6 }}>{error}</p>}

      <button className="modern-add-cart" type="submit" disabled={submitting} style={{ marginTop: 12 }}>
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

function ReviewsList({ productId }) {
  const { getReviews } = useReviews();
  const list = getReviews(productId);

  if (list.length === 0) {
    return <p style={{ color: "#888", marginTop: 10 }}>No customer reviews yet — be the first to review this thread.</p>;
  }

  return (
    <div className="reviews-list">
      {list.map((r) => (
        <div className="review-card" key={r.id}>
          <div className="review-card-top">
            <strong>{r.name}</strong>
            <Stars value={r.rating} />
          </div>
          <p className="review-comment">{r.comment}</p>
          <small className="review-date">
            {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </small>
        </div>
      ))}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const { getProduct, products } = useProducts();
  const { addToCart } = useCart();
  const { getSummary, fetchProductReviews } = useReviews();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = getProduct(id);

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews(product.id);
    }
  }, [product?.id, fetchProductReviews]);

  if (!product) {
    return (
      <div className="site-shell">
        <SiteHeader active="products" />
        <div style={{ padding: 60, textAlign: "center" }}>
          <div className="page-back-row"><BackButton to="/products" /></div>
          <h2>Product not found</h2>
          <Link to="/products" className="btn primary-shop-button">Back to Products</Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const related = products.filter((p) => String(p.id) !== String(product.id) && p.category === product.category).slice(0, 4);
  const summary = getSummary(product.id);

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (isOutOfStock) return;
    addToCart(product, qty);
    navigate("/cart");
  }

  return (
    <div className="site-shell">
      <SiteHeader active="products" />

      <div className="page-content product-detail-page">
        <div className="page-back-row"><BackButton to="/products" label="Back to Products" /></div>

        <div className="product-detail-layout">
          <div className="product-detail-gallery">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <p className="product-category">{product.category}</p>
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-rating">
              <Stars value={summary.count > 0 ? summary.average : 5} />
              <small>
                {summary.count > 0
                  ? `${summary.average.toFixed(1)} (${summary.count} review${summary.count === 1 ? "" : "s"})`
                  : "No reviews yet"}
              </small>
            </div>

            <div className="product-price-row" style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 24 }}>Rs. {product.price}</strong>
              {product.oldPrice > product.price && <del>Rs. {product.oldPrice}</del>}
            </div>

            <p style={{ color: "#666", lineHeight: 1.7, marginTop: 14 }}>{product.description}</p>

            <p style={{ fontSize: 13, color: !isOutOfStock ? "#2f6b45" : "#B23A48", fontWeight: 700, marginTop: 10 }}>
              {!isOutOfStock ? `✓ ${product.stock} items available in stock` : "⚠️ Currently Out of Stock"}
            </p>

            {!isOutOfStock && (
              <div className="qty-row">
                <span className="label">Quantity</span>
                <div className="qty-control">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                className="modern-add-cart"
                style={{ flex: 1, opacity: isOutOfStock ? 0.5 : 1 }}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
              </button>
              <button
                className="secondary-shop-button"
                style={{ flex: 1, opacity: isOutOfStock ? 0.5 : 1 }}
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <h2 style={{ marginTop: 50, marginBottom: 20 }}>Related Products</h2>
            <div className="modern-product-grid">
              {related.map((p) => (
                <Link to={`/product/${p.id}`} className="modern-product-card" key={p.id} style={{ textDecoration: "none" }}>
                  <div className="modern-product-image with-photo">
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className="modern-product-info">
                    <p className="product-category">{p.category}</p>
                    <p className="product-name">{p.name}</p>
                    <div className="product-price-row"><strong>Rs. {p.price}</strong></div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <section className="reviews-section">
          <h2 style={{ marginBottom: 4 }}>Customer Reviews</h2>
          <div className="product-rating" style={{ marginBottom: 20 }}>
            <Stars value={summary.count > 0 ? summary.average : 0} />
            <small>
              {summary.count > 0
                ? `${summary.average.toFixed(1)} out of 5 · ${summary.count} review${summary.count === 1 ? "" : "s"}`
                : "No reviews yet"}
            </small>
          </div>

          <div className="reviews-layout">
            <div>
              <ReviewsList productId={product.id} />
            </div>
            <ReviewForm productId={product.id} onSubmitted={() => fetchProductReviews(product.id)} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetail;
