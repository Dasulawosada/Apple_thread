import { Link } from "react-router-dom";
import "../App.css";
import HeroCarousel from "../HeroCarousel";
import ThreadSpool from "../ThreadSpool";
import CategoryIcon from "../CategoryIcon";
import SiteHeader from "../SiteHeader";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import BackButton from "../BackButton";

const categories = [
  { name: "Sewing Threads", value: "Sewing", tag: "Explore", icon: "spool", cls: "cat-rose" },
  { name: "Embroidery", value: "Embroidery", tag: "Explore", icon: "hoop", cls: "cat-sage" },
  { name: "Industrial Threads", value: "Industrial", tag: "Explore", icon: "cones", cls: "cat-lilac" },
  { name: "Accessories", value: "Accessories", tag: "Explore", icon: "scissors", cls: "cat-peach" },
];

function Home() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const popular = products.slice(0, 4);

  return (
    <div className="site-shell">
      <SiteHeader active="home" />
      <div className="home-back-row"><BackButton fallbackTo="/products" /></div>

      <main className="home-main">
        <section className="blush-hero">
          <div className="blush-hero-text">
            <p className="hero-kicker">PREMIUM QUALITY · SRI LANKA</p>
            <h1 className="gradient-heading">Threads for Every<br />Creation</h1>
            <p className="hero-description">
              Discover colourful sewing and embroidery threads at affordable
              prices, delivered island-wide.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="primary-shop-button">Shop Now →</Link>
              <Link to="/products" className="secondary-shop-button">🏷 View Offers</Link>
            </div>
            <div className="hero-feature-row">
              <div><span className="feature-badge rose">🚚</span><span>Island-wide<br />Delivery</span></div>
              <div><span className="feature-badge peach">🏅</span><span>Premium<br />Quality</span></div>
              <div><span className="feature-badge sage">🛡</span><span>Secure<br />Payment</span></div>
            </div>
          </div>
          <div className="blush-hero-photo">
            <HeroCarousel />
          </div>
        </section>

        <section className="category-section">
          <h2 className="centered-heading">Shop by Category</h2>

          <div className="category-grid pastel-grid">
            {categories.map((cat) => (
              <Link
                to={`/products?category=${encodeURIComponent(cat.value)}`}
                className={`pastel-card ${cat.cls}`}
                key={cat.name}
              >
                <span className="pastel-card-icon">
                  <CategoryIcon type={cat.icon} />
                </span>
                <span className="pastel-card-text">
                  <h3>{cat.name}</h3>
                  <span className="explore-link">{cat.tag} →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="stitch-divider"></div>

        <section className="featured-products-section">
          <div className="modern-section-heading">
            <div>
              <p>HANDPICKED</p>
              <h2>Popular Threads</h2>
            </div>
            <Link to="/products">View All Products →</Link>
          </div>

          {popular.length === 0 ? (
            <p style={{ color: "#888" }}>No products yet — add some from the Admin panel.</p>
          ) : (
            <div className="modern-product-grid">
              {popular.map((product) => (
                <article className="modern-product-card" key={product.id}>
                  <Link to={`/product/${product.id}`} className="modern-product-image with-photo">
                    {product.oldPrice > product.price && (
                      <span className="discount-badge">
                        {Math.round(100 - (product.price / product.oldPrice) * 100)}% OFF
                      </span>
                    )}
                    <button className="wishlist-button" onClick={(e) => e.preventDefault()}>♡</button>
                    <img src={product.image} alt={product.name} />
                  </Link>

                  <div className="modern-product-info">
                    <p className="product-category">{product.category}</p>
                    <Link to={`/product/${product.id}`} className="product-name">
                      {product.name}
                    </Link>

                    <div className="product-rating">
                      <span>★★★★★</span>
                      <small>(128)</small>
                    </div>

                    <div className="product-price-row">
                      <strong>Rs. {product.price}</strong>
                      {product.oldPrice > product.price && <del>Rs. {product.oldPrice}</del>}
                    </div>

                    <button className="modern-add-cart" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="editorial-section">
          <div className="editorial-photo">
            <img
              src="https://images.unsplash.com/photo-1588618777461-81fe15d547be?w=800&auto=format&fit=crop&q=80"
              alt="Handpicked thread spools"
            />
          </div>
          <div className="editorial-text">
            <p>OUR STORY</p>
            <h2>Threads Inspired by Apple Thread</h2>
            <span>
              Every spool is chosen for colour-fastness and strength, so your
              sewing and embroidery projects hold together beautifully.
            </span>
            <Link to="/products">Explore More</Link>
          </div>
        </section>

        <section className="collection-banner">
          <div>
            <p>LIMITED TIME</p>
            <h2>Embroidery Collection<br />Up to 30% Off</h2>
            <Link to="/products">Shop the Collection →</Link>
          </div>
          <ThreadSpool color="#F4D693" size={160} />
        </section>
      </main>

      <div className="newsletter-band">
        <div>
          <h3>Stay in the loop</h3>
          <p>New colours, restocks, and offers — straight to your inbox.</p>
        </div>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </div>

    </div>
  );
}

export default Home;
