import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";

import work01 from "@/assets/portfolio/work-01.jpg";
import work02 from "@/assets/portfolio/work-02.jpg";
import work03 from "@/assets/portfolio/work-03.jpg";
import work04 from "@/assets/portfolio/work-04.jpg";
import work05 from "@/assets/portfolio/work-05.jpg";
import work06 from "@/assets/portfolio/work-06.jpg";
import work07 from "@/assets/portfolio/work-07.jpg";
import work08 from "@/assets/portfolio/work-08.jpg";
import work09 from "@/assets/portfolio/work-09.jpg";
import work10 from "@/assets/portfolio/work-10.jpg";
import work11 from "@/assets/portfolio/work-11.jpg";
import work12 from "@/assets/portfolio/work-12.jpg";
import work13 from "@/assets/portfolio/work-13.jpg";
import work14 from "@/assets/portfolio/work-14.jpg";
import work15 from "@/assets/portfolio/work-15.jpg";
import work16 from "@/assets/portfolio/work-16.jpg";
import work17 from "@/assets/portfolio/work-17.jpg";
import work18 from "@/assets/portfolio/work-18.jpg";
import work19 from "@/assets/portfolio/work-19.jpg";

const portfolioItems = [
  { src: work01, alt: "Межкомнатная дверь с чёрными стеклянными вставками" },
  { src: work02, alt: "Белая классическая дверь с рифлёным стеклом" },
  { src: work03, alt: "Двустворчатая белая дверь с филёнками" },
  { src: work04, alt: "Стеклянная дверь в стиле лофт" },
  { src: work05, alt: "Раздвижная перегородка с матовым стеклом" },
  { src: work06, alt: "Чёрная раздвижная дверь с витражными стёклами" },
  { src: work07, alt: "Стеклянная раздвижная дверь на направляющей" },
  { src: work08, alt: "Двери в деревянном доме" },
  { src: work09, alt: "Классическая дверь с золотой фурнитурой" },
  { src: work10, alt: "Белая дверь с золотыми молдингами" },
  { src: work11, alt: "Коридор с белыми дверями и золотой фурнитурой" },
  { src: work12, alt: "Зелёная дверь в современном интерьере" },
  { src: work13, alt: "Зелёная межкомнатная дверь с молдингами" },
  { src: work14, alt: "Зелёные двери со стеклом в деревянном доме" },
  { src: work15, alt: "Три зелёные двери в доме из бруса" },
  { src: work16, alt: "Входная дверь с дизайнерской панелью" },
  { src: work17, alt: "Чёрная входная дверь с хромированной ручкой" },
  { src: work18, alt: "Входная дверь со стеклянной вставкой" },
  { src: work19, alt: "Белая входная дверь с зеркалом" },
];

/* ─── Lightbox ─── */
const Lightbox = ({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: typeof portfolioItems;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-doorium-smoky/95 backdrop-blur-sm" />
      <button onClick={onClose} className="absolute top-6 right-6 z-10 text-doorium-platinum/70 hover:text-doorium-platinum transition-colors">
        <X size={32} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 md:left-8 z-10 text-doorium-platinum/50 hover:text-doorium-platinum transition-colors">
        <ChevronLeft size={40} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 md:right-8 z-10 text-doorium-platinum/50 hover:text-doorium-platinum transition-colors">
        <ChevronRight size={40} />
      </button>
      <img
        src={images[index].src}
        alt={images[index].alt}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[85vh] max-w-[90vw] object-contain"
      />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-body text-sm text-doorium-platinum/60">
        {index + 1} / {images.length}
      </p>
    </div>
  );
};

/* ─── 3D Carousel ─── */
const Carousel3D = ({
  items,
  activeIndex,
  onPrev,
  onNext,
  onClickCenter,
}: {
  items: typeof portfolioItems;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onClickCenter: () => void;
}) => {
  // Show 5 slides: -2, -1, 0, +1, +2
  const getSlideIndex = (offset: number) =>
    (activeIndex + offset + items.length) % items.length;

  const positions = [
    { offset: -2, x: "-75%",  scale: 0.45, z: -200, opacity: 0.25, blur: 6 },
    { offset: -1, x: "-38%",  scale: 0.65, z: -100, opacity: 0.55, blur: 3 },
    { offset:  0, x: "0%",    scale: 1,    z: 0,    opacity: 1,    blur: 0 },
    { offset:  1, x: "38%",   scale: 0.65, z: -100, opacity: 0.55, blur: 3 },
    { offset:  2, x: "75%",   scale: 0.45, z: -200, opacity: 0.25, blur: 6 },
  ];

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onPrev();
      else onNext();
    }
    setTouchStart(null);
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onPrev, onNext]);

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "clamp(400px, 65vh, 700px)", perspective: "1200px" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation arrows */}
      <button
        onClick={onPrev}
        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/60 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/60 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slides */}
      <div className="absolute inset-0 flex items-center justify-center">
        {positions.map(({ offset, x, scale, z, opacity, blur }) => {
          const idx = getSlideIndex(offset);
          const item = items[idx];
          const isCenter = offset === 0;

          return (
            <div
              key={`${offset}-${idx}`}
              className="absolute transition-all duration-700 ease-out"
              style={{
                transform: `translateX(${x}) translateZ(${z}px) scale(${scale})`,
                opacity,
                filter: blur > 0 ? `blur(${blur}px)` : "none",
                zIndex: 10 - Math.abs(offset),
                cursor: isCenter ? "pointer" : "default",
              }}
              onClick={isCenter ? onClickCenter : offset < 0 ? onPrev : onNext}
            >
              {/* Card with frame */}
              <div
                className={`border transition-all duration-500 p-3 md:p-4 ${
                  isCenter
                    ? "border-primary/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
                    : "border-primary/10"
                }`}
                style={{
                  width: "clamp(280px, 28vw, 420px)",
                  background: "hsl(50 14% 10% / 0.6)",
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                  {/* Center card hover gradient */}
                  {isCenter && (
                    <div className="absolute inset-0 bg-gradient-to-t from-doorium-smoky/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  )}
                </div>
              </div>

              {/* Label for center */}
              {isCenter && (
                <div className="mt-4 text-center">
                  <p className="font-body text-sm text-doorium-platinum/80 mb-1">
                    {item.alt}
                  </p>
                  <p className="font-body text-[10px] tracking-[0.3em] text-primary/50">
                    {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Page ─── */
const PortfolioPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const goNext = useCallback(() => {
    setActiveIndex((p) => (p + 1) % portfolioItems.length);
  }, []);
  const goPrev = useCallback(() => {
    setActiveIndex((p) => (p - 1 + portfolioItems.length) % portfolioItems.length);
  }, []);

  const openLightbox = useCallback(() => setLightboxIndex(activeIndex), [activeIndex]);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev - 1 + portfolioItems.length) % portfolioItems.length : null);
  }, []);
  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev + 1) % portfolioItems.length : null);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 8%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-6 md:pb-10 text-center px-8">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3 animate-fade-in-up">
          Портфолио
        </p>
        <h1
          className="font-display-stencil text-5xl md:text-6xl lg:text-7xl text-doorium-platinum leading-[0.95] mb-4 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          НАШИ РАБОТЫ
        </h1>
        <p
          className="font-body text-base text-muted-foreground max-w-md mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Каждый проект — это внимание к деталям и безупречный результат.
        </p>
      </section>

      {/* 3D Carousel */}
      <section className="pb-16 md:pb-24">
        <Carousel3D
          items={portfolioItems}
          activeIndex={activeIndex}
          onPrev={goPrev}
          onNext={goNext}
          onClickCenter={openLightbox}
        />

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {portfolioItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 md:py-28 px-8 md:px-16 lg:px-24 text-center"
        style={{
          background: "linear-gradient(to bottom, hsl(50 14% 8%) 0%, hsl(60 8% 13%) 50%, hsl(70 7% 16%) 100%)",
        }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-4">
          Хотите так же?
        </p>
        <h2 className="font-display-stencil text-3xl md:text-4xl text-doorium-platinum leading-[0.95] mb-8">
          ЗАКАЖИТЕ МОНТАЖ
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/services"
            className="inline-block font-display-stencil text-sm tracking-[0.2em] uppercase px-10 py-4 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Услуги и цены
          </Link>
          <Link
            to="/#contacts"
            className="inline-block font-display-stencil text-sm tracking-[0.2em] uppercase px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300"
          >
            Оставить заявку
          </Link>
        </div>
      </section>

      {/* Back */}
      <section className="py-12 px-8 md:px-16 lg:px-24 text-center" style={{ background: "hsl(70 7% 16%)" }}>
        <Link to="/" className="font-body text-sm tracking-[0.15em] uppercase text-primary hover:text-doorium-platinum transition-colors duration-300">
          ← На главную
        </Link>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={portfolioItems}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
};

export default PortfolioPage;
