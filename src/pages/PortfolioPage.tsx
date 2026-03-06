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

// No masonry heights needed — uniform grid

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-doorium-smoky/95 backdrop-blur-sm" />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-doorium-platinum/70 hover:text-doorium-platinum transition-colors"
      >
        <X size={32} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 z-10 text-doorium-platinum/50 hover:text-doorium-platinum transition-colors"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 z-10 text-doorium-platinum/50 hover:text-doorium-platinum transition-colors"
      >
        <ChevronRight size={40} />
      </button>
      <img
        src={images[index].src}
        alt={images[index].alt}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[85vh] max-w-[90vw] object-contain"
        style={{
          animation: "fade-in 0.3s ease-out",
        }}
      />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-body text-sm text-doorium-platinum/60">
        {index + 1} / {images.length}
      </p>
    </div>
  );
};

/* ─── Portfolio card with frame ─── */
const PortfolioCard = ({
  item,
  index,
  onClick,
}: {
  item: (typeof portfolioItems)[0];
  index: number;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group cursor-pointer"
      onClick={onClick}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease-out ${index * 0.06}s, transform 0.6s ease-out ${index * 0.06}s`,
      }}
    >
      {/* Outer frame */}
      <div className="border border-primary/20 group-hover:border-primary/50 transition-all duration-500 p-3 md:p-4">
        {/* Inner image container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-doorium-smoky/0 group-hover:bg-doorium-smoky/50 transition-all duration-500 flex items-end justify-center pb-6">
            <p className="font-body text-xs md:text-sm text-doorium-platinum text-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0 px-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {item.alt}
            </p>
          </div>
        </div>
      </div>
      {/* Number below frame */}
      <p className="font-body text-[10px] tracking-[0.3em] text-primary/40 group-hover:text-primary/70 transition-colors duration-500 mt-3 text-center uppercase">
        {String(index + 1).padStart(2, "0")}
      </p>
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
    <div className="min-h-screen" style={{ background: "hsl(50 14% 8%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-8 md:px-16 lg:px-24">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3 animate-fade-in-up">
          Портфолио
        </p>
        <h1 className="font-display-stencil text-5xl md:text-6xl lg:text-7xl text-doorium-platinum leading-[0.95] mb-4 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}>
          НАШИ РАБОТЫ
        </h1>
        <p className="font-body text-base text-muted-foreground max-w-lg animate-fade-in-up"
           style={{ animationDelay: "0.2s" }}>
          Каждый проект — это внимание к деталям, точность монтажа и безупречный результат.
          Вот некоторые из наших недавних работ в Москве.
        </p>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 lg:px-20 pb-24 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {portfolioItems.map((item, i) => (
            <PortfolioCard
              key={i}
              item={item}
              index={i}
              onClick={() => openLightbox(i)}
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
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
};

export default PortfolioPage;
