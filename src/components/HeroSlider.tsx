import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Product, formatPrice } from "@/hooks/useProducts";

interface HeroSliderProps {
  products: Product[];
  isLoading?: boolean;
}

const HeroSlider = ({ products, isLoading }: HeroSliderProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
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

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-muted animate-pulse aspect-[16/9] sm:aspect-[21/9]" />
    );
  }

  if (slides.length === 0) return null;

  const currentProduct = slides[activeIndex];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border group">
      {/* Slide Content */}
      <div className="relative flex flex-col sm:flex-row items-stretch min-h-[300px] sm:min-h-[340px] lg:min-h-[400px]">
        {/* Image Side */}
        <div className="relative w-full sm:w-[50%] lg:w-[55%] flex-shrink-0 order-first">
          <div
            className="w-full h-48 sm:h-full bg-center bg-contain bg-no-repeat bg-muted/30 transition-all duration-500"
            style={{ backgroundImage: `url('${currentProduct.image_url}')` }}
          />
        </div>

        {/* Text Side */}
        <div className="flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary mb-3 bg-primary/10 px-3 py-1 rounded-full w-fit">
            <span className="material-symbols-outlined text-[14px]">local_offer</span>
            {currentProduct.brand || "Featured"}
          </span>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 line-clamp-2 leading-snug">
            {currentProduct.name}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2 max-w-sm">
            {currentProduct.description || "Premium quality gadget at an unbeatable price."}
          </p>
          <div className="mb-5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {formatPrice(currentProduct.price)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/product/${currentProduct.slug}`)}
              className="btn-primary text-xs sm:text-sm"
            >
              <span className="material-symbols-outlined text-base">shopping_bag</span>
              Shop Now
            </button>
            <button
              onClick={() => navigate("/products")}
              className="btn-outline text-xs sm:text-sm"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Arrow Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-lg text-foreground">chevron_left</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-lg text-foreground">chevron_right</span>
          </button>
        </>
      )}

      {/* Dots + Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-7 h-2 bg-primary"
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
