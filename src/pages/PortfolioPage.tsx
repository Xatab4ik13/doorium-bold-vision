import { useState, useEffect, useRef, useCallback } from "react";
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

/* ─── Horizontal scroll strip ─── */
const ScrollStrip = ({
  items,
  onClickImage,
}: {
  items: typeof portfolioItems;
  onClickImage: (globalIndex: number) => void;
}) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!stripRef.current) return;
    setIsDragging(true);
    dragMoved.current = false;
    setStartX(e.pageX - stripRef.current.offsetLeft);
    setScrollLeft(stripRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !stripRef.current) return;
    e.preventDefault();
    const x = e.pageX - stripRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) dragMoved.current = true;
    stripRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  // Mouse wheel → horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (!stripRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      stripRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={stripRef}
      className="flex gap-5 md:gap-7 overflow-x-auto scroll-smooth cursor-grab active:cursor-grabbing select-none"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Left padding spacer */}
      <div className="shrink-0 w-8 md:w-16 lg:w-24" />

      {items.map((item, i) => (
        <div
          key={i}
          className="group shrink-0 cursor-pointer"
          onClick={() => {
            if (!dragMoved.current) onClickImage(i);
          }}
        >
          {/* Frame */}
          <div className="border border-primary/20 group-hover:border-primary/50 transition-all duration-500 p-2 md:p-3">
            <div className="relative overflow-hidden" style={{ width: "clamp(220px, 22vw, 380px)", aspectRatio: "3/4" }}>
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hover vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-doorium-smoky/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="absolute bottom-3 left-3 right-3 font-body text-[11px] text-doorium-platinum opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {item.alt}
              </p>
            </div>
          </div>
          {/* Number */}
          <p className="font-body text-[10px] tracking-[0.3em] text-primary/30 group-hover:text-primary/70 transition-colors duration-500 mt-2 text-center">
            {String(i + 1).padStart(2, "0")}
          </p>
        </div>
      ))}

      {/* Right padding spacer */}
      <div className="shrink-0 w-8 md:w-16 lg:w-24" />
    </div>
  );
};

/* ─── Page ─── */
const PortfolioPage = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev - 1 + portfolioItems.length) % portfolioItems.length : null);
  }, []);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev + 1) % portfolioItems.length : null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(50 14% 8%)" }}>
      <Header />

      {/* Hero intro */}
      <section className="pt-32 md:pt-40 pb-8 md:pb-12 px-8 md:px-16 lg:px-24">
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
          className="font-body text-base text-muted-foreground max-w-lg animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Листайте ленту — каждый кадр, это реальный проект в Москве.
        </p>
        <p
          className="font-body text-xs tracking-[0.2em] uppercase text-primary/40 mt-6 animate-fade-in-up flex items-center gap-2"
          style={{ animationDelay: "0.35s" }}
        >
          <span className="inline-block w-8 h-px bg-primary/30" />
          Тяните в сторону или скролльте
        </p>
      </section>

      {/* Full-width horizontal scroll */}
      <section className="py-8 md:py-12 flex-1">
        <ScrollStrip items={portfolioItems} onClickImage={openLightbox} />
      </section>

      {/* Counter */}
      <section className="px-8 md:px-16 lg:px-24 pb-12 md:pb-16">
        <div className="flex items-center gap-4">
          <span className="font-display-stencil text-4xl md:text-5xl text-primary/20">
            {String(portfolioItems.length).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-primary/10" />
          <span className="font-body text-xs tracking-[0.2em] uppercase text-primary/40">
            Выполненных проектов
          </span>
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
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
};

export default PortfolioPage;
