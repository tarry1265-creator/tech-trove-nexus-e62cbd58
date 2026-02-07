import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Product, formatPrice } from "@/hooks/useProducts";

interface HeroSliderProps {
  products: Product[];
  isLoading?: boolean;
}

const HeroSlider = ({ products, isLoading }: HeroSliderProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slides = products.slice(0, 5);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }, [nextSlide, prevSlide]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-muted animate-pulse h-[220px] sm:h-[280px] lg:h-[360px]" />
    );
  }

  if (slides.length === 0) return null;

  const currentProduct = slides[activeIndex];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-card border border-border group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Content */}
      <div className="relative flex flex-row items-stretch h-[220px] sm:h-[280px] lg:h-[360px]">
        {/* Image Side */}
        <div className="relative w-[40%] sm:w-[45%] lg:w-[50%] flex-shrink-0 bg-muted/20">
          <img
            src={currentProduct.image_url}
            alt={currentProduct.name}
            className="w-full h-full object-contain p-3 sm:p-5 lg:p-8 transition-all duration-500"
          />
        </div>

        {/* Text Side */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col justify-center min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary mb-2 bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit">
            <span className="material-symbols-outlined text-[12px] sm:text-[14px]">local_offer</span>
            {currentProduct.brand || "Featured"}
          </span>
          <h2 className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground mb-1 sm:mb-2 line-clamp-2 leading-snug">
            {currentProduct.name}
          </h2>
          <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm mb-2 sm:mb-4 line-clamp-2 max-w-sm hidden sm:block">
            {currentProduct.description || "Premium quality gadget at an unbeatable price."}
          </p>
          <div className="mb-3 sm:mb-5">
            <span className="text-base sm:text-xl lg:text-3xl font-bold text-foreground">
              {formatPrice(currentProduct.price)}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(`/product/${currentProduct.slug}`)}
              className="btn-primary text-[11px] sm:text-xs lg:text-sm px-3 sm:px-5 py-2"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">shopping_bag</span>
              <span className="hidden sm:inline">Shop Now</span>
              <span className="sm:hidden">Buy</span>
            </button>
            <button
              onClick={() => navigate("/products")}
              className="btn-outline text-[11px] sm:text-xs lg:text-sm px-3 sm:px-5 py-2 hidden sm:inline-flex"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Arrow Navigation - desktop only */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-lg text-foreground">chevron_left</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-lg text-foreground">chevron_right</span>
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
