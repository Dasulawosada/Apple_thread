import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import BackButton from "../BackButton";

function Cart() {
  const { items, updateQty, removeFromCart, subtotal } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const delivery = items.length > 0
    ? (subtotal >= Number(settings.freeDeliveryThreshold) ? 0 : Number(settings.deliveryFee))
    : 0;
  const total = subtotal + delivery;

  return (
    <div className="site-shell">
      <SiteHeader active="cart" />

      <div className="page-content cart-page-content">
        <div className="page-back-row"><BackButton fallbackTo="/products" /></div>
        <h1 className="page-title" style={{ marginBottom: 20 }}>Your Cart {items.length > 0 && `(${items.length} item${items.length > 1 ? "s" : ""})`}</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>🛒</p>
            <p style={{ color: "#888", marginBottom: 20 }}>Your cart is empty.</p>
            <Link to="/products" className="primary-shop-button">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-line" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-line-info">
                    <Link to={`/product/${item.id}`} className="product-name">{item.name}</Link>
                    <p style={{ color: "#888", fontSize: 12 }}>Rs. {item.price} each</p>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>–</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <strong style={{ width: 90, textAlign: "right" }}>Rs. {item.qty * item.price}</strong>
                  <button className="cart-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 style={{ fontSize: 16 }}>Order Summary</h2>
              <p className="summary-row"><span>Subtotal</span><span>Rs. {subtotal}</span></p>
              <p className="summary-row"><span>Delivery</span><span>{delivery === 0 ? "Free" : `Rs. ${delivery}`}</span></p>
              <hr />
              <p className="summary-row" style={{ fontWeight: 700, fontSize: 16 }}><span>Total</span><span>Rs. {total}</span></p>
              <input className="input-plain" placeholder="Promo code" />
              <button className="modern-add-cart" style={{ width: "100%", marginTop: 10 }} onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
