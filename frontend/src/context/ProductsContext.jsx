import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getImageUrl } from "../api/client";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await api.getProducts(params);
      // Ensure image URLs are normalized
      const normalized = data.map((p) => ({
        ...p,
        image: getImageUrl(p.image),
      }));
      setProducts(normalized);
      setError(null);
      return normalized;
    } catch (err) {
      console.error("Failed to load products from database:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function addProduct(product) {
    try {
      const created = await api.createProduct(product);
      await fetchProducts();
      return created;
    } catch (err) {
      console.error("Failed to add product:", err);
      throw err;
    }
  }

  async function updateProduct(id, updates) {
    try {
      const updated = await api.updateProduct(id, updates);
      await fetchProducts();
      return updated;
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  }

  async function deleteProduct(id) {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  }

  function getProduct(id) {
    return products.find((p) => String(p.id) === String(id));
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
