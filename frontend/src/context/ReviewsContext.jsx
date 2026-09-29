import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../api/client";

const ReviewsContext = createContext(null);

export function ReviewsProvider({ children }) {
  const [reviewsCache, setReviewsCache] = useState({});
  const [summaryCache, setSummaryCache] = useState({});

  const fetchProductReviews = useCallback(async (productId) => {
    try {
      const data = await api.getReviews(productId);
      setReviewsCache((prev) => ({ ...prev, [productId]: data.reviews }));
      setSummaryCache((prev) => ({ ...prev, [productId]: data.summary }));
      return data;
    } catch (err) {
      console.error(`Failed to fetch reviews for product ${productId}:`, err);
      return { reviews: [], summary: { count: 0, average: 0 } };
    }
  }, []);

  async function addReview(productId, { name, rating, comment }) {
    try {
      const newReview = await api.addReview(productId, { name, rating, comment });
      await fetchProductReviews(productId);
      return newReview;
    } catch (err) {
      console.error("Failed to add review:", err);
      throw err;
    }
  }

  function getReviews(productId) {
    return reviewsCache[productId] || [];
  }

  function getSummary(productId) {
    return summaryCache[productId] || { count: 0, average: 0 };
  }

  return (
    <ReviewsContext.Provider
      value={{
        getReviews,
        getSummary,
        addReview,
        fetchProductReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside <ReviewsProvider>");
  return ctx;
}
