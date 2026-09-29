import { useState, useEffect, useRef } from "react";
import threadCones from "./assets/thread-cones.jpg";
import threadColorful from "./assets/thread-colorful.jpg";
import buttonImg from "./assets/button.jpg";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1776107490710-f5c08a0c6a98?w=900&auto=format&fit=crop&q=80",
    badge: "Bestseller",
    title: "Vibrant Cotton Spools",
    caption: "Over 120+ shades of color-fast tailoring thread",
  },
  {
    image: threadCones,
    badge: "Industrial Grade",
    title: "Heavy-Duty Sewing Cones",
    caption: "Extra strength polyester & nylon for garment production",
  },
  {
    image: "https://images.unsplash.com/photo-1588618777461-81fe15d547be?w=900&auto=format&fit=crop&q=80",
    badge: "Luxury Sheen",
    title: "Silk Embroidery Floss",
    caption: "Delicate and lustrous threads for decorative stitching",
  },
  {
    image: threadColorful,
    badge: "Combo Packs",
    title: "All-in-One Thread Sets",
    caption: "Curated palettes for boutique fashion designers",
  },
  {
    image: buttonImg,
    badge: "Craft & Tailoring",
    title: "Tailoring Accessories & Buttons",
    caption: "Premium buttons, needles, and tailoring supplies",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, isPaused]);

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Thread Collection Showcase"
    >
      <div className="hero-carousel-slides">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-carousel-slide ${idx === current ? "active" : ""}`}
            aria-hidden={idx !== current}
          >
            <img src={slide.image} alt={slide.title} className="hero-carousel-img" />
            <div className="hero-slide-overlay">
              <span className="hero-slide-badge">{slide.badge}</span>
              <h3 className="hero-slide-title">{slide.title}</h3>
              <p className="hero-slide-desc">{slide.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="hero-carousel-nav prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        className="hero-carousel-nav next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Pagination Dots */}
      <div className="hero-carousel-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`hero-carousel-dot ${idx === current ? "active" : ""}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
