import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Product, formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface HeroSliderProps {
  products: Product[];
  isLoading?: boolean;
}

const HeroSlider = ({ products, isLoading }: HeroSliderProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slides = products.slice(0, 5);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

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

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (isLoading) {
    return <div className="w-full rounded-2xl bg-muted animate-pulse h-[200px] sm:h-[260px] lg:h-[320px]" />;
  }

  if (slides.length === 0) return null;

  const currentProduct = slides[activeIndex];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(currentProduct);
    toast.success(`${currentProduct.name} added to cart`);
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden group cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => navigate(`/product/${currentProduct.slug}`)}
    >
      {/* Dark card with product image */}
      <div className="relative h-[200px] sm:h-[260px] lg:h-[320px] bg-foreground/90 rounded-2xl overflow-hidden">
        {/* Product image on right side */}
        <img
          src={currentProduct.image_url}
          alt={currentProduct.name}
          className="absolute right-0 bottom-0 w-[55%] sm:w-[50%] h-full object-contain transition-all duration-500"
        />

        {/* Text overlay on left */}
        <div className="relative z-10 p-5 sm:p-7 lg:p-10 flex flex-col justify-end h-full max-w-[55%]">
          <h3 className="text-white text-base sm:text-xl lg:text-2xl font-bold line-clamp-2 leading-tight mb-1">
            {currentProduct.name}
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mb-3 line-clamp-1">
            {currentProduct.brand || "BRAINHUB"} • {currentProduct.rating || "4.5"} <span className="text-warning">★</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${currentProduct.slug}`); }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:opacity-90 transition-all"
            >
              View Item
            </button>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-white text-lg">shopping_bag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-5 sm:left-7 lg:left-10 flex items-center gap-1.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
