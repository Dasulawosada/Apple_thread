import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import BackButton from "../BackButton";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useReviews } from "../context/ReviewsContext";

function Products() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { getSummary } = useReviews();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search") || "";

  const [checkedCats, setCheckedCats] = useState(categoryParam ? [categoryParam] : []);
  const [priceBand, setPriceBand] = useState("");
  const [sort, setSort] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Sync category filter when URL ?category= changes
  useEffect(() => {
    if (categoryParam) {
      setCheckedCats([categoryParam]);
    }
  }, [categoryParam]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  function toggleCat(cat) {
    if (categoryParam) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("category");
      setSearchParams(nextParams, { replace: true });
    }
    setCheckedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function clearSearch() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams, { replace: true });
  }

  const hasActiveFilters =
    checkedCats.length > 0 ||
    priceBand !== "" ||
    inStockOnly ||
    onSaleOnly ||
    minRating > 0 ||
    Boolean(searchParam);

  function clearAllFilters() {
    setSearchParams({}, { replace: true });
    setCheckedCats([]);
    setPriceBand("");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinRating(0);
  }

  const filtered = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (checkedCats.length > 0) {
      list = list.filter((p) => checkedCats.includes(p.category));
    }

    // Price band filter
    if (priceBand === "under500") list = list.filter((p) => p.price < 500);
    if (priceBand === "500to1000") list = list.filter((p) => p.price >= 500 && p.price <= 1000);
    if (priceBand === "above1000") list = list.filter((p) => p.price > 1000);

    // Stock & Sale
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (onSaleOnly) list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);

    // Rating
    if (minRating > 0) {
      list = list.filter((p) => {
        const { count, average } = getSummary(p.id);
        return count === 0 ? false : average >= minRating;
      });
    }

    // Sorting
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, searchParam, checkedCats, priceBand, sort, inStockOnly, onSaleOnly, minRating, getSummary]);

  return (
    <div className="products-page">
      <SiteHeader active="products" />
      <div className="products-back-row"><BackButton fallbackTo="/" /></div>

      <div className="products-page-heading">
        <p className="eyebrow-label">SHOP OUR COLLECTION</p>
        <h1>
          {searchParam
            ? `Search Results for "${searchParam}"`
            : categoryParam
            ? `${categoryParam} Threads`
            : "All Threads & Accessories"}
        </h1>
        {searchParam && (
          <div className="active-search-chip">
            <span>Query: <strong>"{searchParam}"</strong></span>
            <button onClick={clearSearch} title="Clear search">✕ Clear Search</button>
          </div>
        )}
      </div>

      <div className="products-layout">
        <aside className="filters">
          <div className="filters-head">
            <h2>Filters</h2>
            {hasActiveFilters && (
              <button className="btn-clear-all" onClick={clearAllFilters}>✕ Clear all</button>
            )}
          </div>

          <div className="filter-group">
            <h3>Categories</h3>
            {categories.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={checkedCats.includes(cat)}
                  onChange={() => toggleCat(cat)}
                />
                {" "}{cat}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Price Range</h3>
            <label>
              <input type="radio" name="price" checked={priceBand === "under500"} onChange={() => setPriceBand("under500")} /> Under Rs. 500
            </label>
            <label>
              <input type="radio" name="price" checked={priceBand === "500to1000"} onChange={() => setPriceBand("500to1000")} /> Rs. 500 – 1,000
            </label>
            <label>
              <input type="radio" name="price" checked={priceBand === "above1000"} onChange={() => setPriceBand("above1000")} /> Above Rs. 1,000
            </label>
            {priceBand && (
              <button className="btn-clear-filter" onClick={() => setPriceBand("")}>Clear price filter</button>
            )}
          </div>

          <div className="filter-group">
            <h3>Availability</h3>
            <label>
              <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} /> In Stock Only
            </label>
            <label>
              <input type="checkbox" checked={onSaleOnly} onChange={() => setOnSaleOnly((v) => !v)} /> On Sale
            </label>
          </div>

          <div className="filter-group">
            <h3>Customer Rating</h3>
            {[4, 3, 2].map((r) => (
              <label key={r}>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => setMinRating(r)}
                />
                {" "}{"★".repeat(r)}
                <span className="rating-and-up"> &amp; up</span>
              </label>
            ))}
            {minRating > 0 && (
              <button className="btn-clear-filter" onClick={() => setMinRating(0)}>Clear rating filter</button>
            )}
          </div>
        </aside>

        <section className="products-area">
          <div className="products-toolbar">
            <p><strong>{filtered.length}</strong> products found</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort by: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
              <p>Loading products from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-results-box">
              <h3>No products found</h3>
              <p>We couldn't find any threads matching your search or filters.</p>
              <button className="primary-shop-button" onClick={clearAllFilters}>Reset All Filters</button>
            </div>
          ) : (
            <div className="modern-product-grid products-page-grid">
              {filtered.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const summary = getSummary(product.id);
                const avgRating = Math.round(summary.average) || 5;

                return (
                  <article className="modern-product-card" key={product.id}>
                    <Link to={`/product/${product.id}`} className="modern-product-image with-photo">
                      {product.oldPrice > product.price && (
                        <span className="discount-badge">
                          {Math.round(100 - (product.price / product.oldPrice) * 100)}% OFF
                        </span>
                      )}
                      {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </Link>

                    <div className="modern-product-info">
                      <p className="product-category">{product.category}</p>
                      <Link to={`/product/${product.id}`} className="product-name">
                        {product.name}
                      </Link>

                      <div className="product-rating">
                        <span>{"★".repeat(avgRating)}{"☆".repeat(5 - avgRating)}</span>
                        <small>{summary.count > 0 ? `(${summary.count})` : "(No reviews)"}</small>
                      </div>

                      <div className="product-price-row">
                        <strong>Rs. {product.price}</strong>
                        {product.oldPrice > product.price && <del>Rs. {product.oldPrice}</del>}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}>
                        <Link to={`/product/${product.id}`} className="btn-outline-sm" style={{ flex: 1, textAlign: "center", textDecoration: "none", padding: "9px 0" }}>
                          View
                        </Link>
                        <button
                          className="modern-add-cart"
                          style={{ flex: 1, padding: "9px 0", opacity: isOutOfStock ? 0.5 : 1 }}
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product)}
                        >
                          {isOutOfStock ? "Sold Out" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Products;