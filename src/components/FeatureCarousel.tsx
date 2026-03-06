import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt: string;
}

interface FeatureCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  autoPlayInterval?: number;
}

export const FeatureCarousel = React.forwardRef<HTMLDivElement, FeatureCarouselProps>(
  ({ images, autoPlayInterval = 4000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(Math.floor(images.length / 2));
    const [isPaused, setIsPaused] = React.useState(false);

    const handleNext = React.useCallback(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = React.useCallback(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    React.useEffect(() => {
      if (isPaused) return;
      const timer = setInterval(handleNext, autoPlayInterval);
      return () => clearInterval(timer);
    }, [handleNext, autoPlayInterval, isPaused]);

    // Keyboard
    React.useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [handlePrev, handleNext]);

    // Touch
    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) diff > 0 ? handlePrev() : handleNext();
      setTouchStart(null);
    };

    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Carousel track */}
        <div className="relative flex items-center justify-center" style={{ height: "clamp(400px, 65vh, 720px)" }}>
          {images.map((image, index) => {
            const offset = index - currentIndex;
            const total = images.length;
            let pos = (offset + total) % total;
            if (pos > Math.floor(total / 2)) pos = pos - total;

            const isCenter = pos === 0;
            const isAdjacent = Math.abs(pos) === 1;

            return (
              <div
                key={index}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  transform: `translateX(${pos * 55}%) scale(${isCenter ? 1 : isAdjacent ? 0.7 : 0.5})`,
                  zIndex: isCenter ? 30 : isAdjacent ? 20 : 10,
                  opacity: Math.abs(pos) > 2 ? 0 : isCenter ? 1 : isAdjacent ? 0.5 : 0.2,
                  filter: isCenter ? "none" : `blur(${Math.abs(pos) * 3}px)`,
                  visibility: Math.abs(pos) > 2 ? "hidden" : "visible",
                }}
                onClick={isCenter ? undefined : pos < 0 ? handlePrev : handleNext}
              >
                {/* Framed card */}
                <div
                  className={cn(
                    "border p-2.5 md:p-3.5 transition-all duration-500",
                    isCenter
                      ? "border-primary/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
                      : "border-primary/10 cursor-pointer"
                  )}
                  style={{
                    width: "clamp(260px, 26vw, 400px)",
                    background: "hsl(50 14% 10% / 0.5)",
                  }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Center label */}
                {isCenter && (
                  <div className="mt-4 text-center">
                    <p className="font-body text-sm text-doorium-platinum/80 mb-1">
                      {image.alt}
                    </p>
                    <p className="font-body text-[10px] tracking-[0.3em] text-primary/50">
                      {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full border border-primary/25 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/60 transition-all duration-300 backdrop-blur-sm"
          aria-label="Previous"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full border border-primary/25 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/60 transition-all duration-300 backdrop-blur-sm"
          aria-label="Next"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === currentIndex
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-primary/20 hover:bg-primary/40"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

FeatureCarousel.displayName = "FeatureCarousel";
