import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function getStorageKey(user) {
  if (user && user.id) {
    return `apple-thread-cart_u_${user.id}`;
  }
  return "apple-thread-cart_guest";
}

function readStoredCart(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Could not read cart from storage key:", key, e);
  }
  return [];
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const activeKey = getStorageKey(user);

  // Initialize cart for currently logged-in user or guest
  const [items, setItems] = useState(() => readStoredCart(activeKey));
  const prevUserIdRef = useRef(user?.id ?? null);
  const isInitialMount = useRef(true);

  // When user logs in, logs out, or switches account:
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id ?? null;
    prevUserIdRef.current = currentUserId;

    if (prevUserId !== currentUserId) {
      const newKey = getStorageKey(user);
      const userSavedCart = readStoredCart(newKey);

      // If user just logged in from guest session, merge guest items
      if (!prevUserId && currentUserId) {
        const guestItems = readStoredCart("apple-thread-cart_guest");
        if (guestItems.length > 0) {
          const merged = [...userSavedCart];
          for (const gItem of guestItems) {
            const existing = merged.find((i) => i.id === gItem.id);
            if (existing) {
              existing.qty += gItem.qty;
            } else {
              merged.push(gItem);
            }
          }
          localStorage.removeItem("apple-thread-cart_guest");
          localStorage.setItem(newKey, JSON.stringify(merged));
          setItems(merged);
          return;
        }
      }

      // Switch to this user's distinct cart
      setItems(userSavedCart);
    }
  }, [user]);

  // Persist items whenever items or active user changes
  useEffect(() => {
    localStorage.setItem(activeKey, JSON.stringify(items));
  }, [items, activeKey]);

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty,
        },
      ];
    });
  }

  function updateQty(id, qty) {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
    localStorage.removeItem(activeKey);
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
