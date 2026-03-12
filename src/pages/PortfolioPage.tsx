import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FeatureCarousel } from "@/components/FeatureCarousel";

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

/* ─── Page ─── */
const PortfolioPage = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev - 1 + portfolioItems.length) % portfolioItems.length : null);
  }, []);
  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev + 1) % portfolioItems.length : null);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-6 md:pb-10 text-center px-8">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3 animate-fade-in-up">
          Портфолио
        </p>
        <h1
          className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-doorium-platinum leading-[0.95] mb-4 animate-fade-in-up tracking-wide"
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

      {/* 3D Feature Carousel */}
      <section className="pb-20 md:pb-28">
        <FeatureCarousel images={portfolioItems} autoPlayInterval={4500} />
      </section>

      {/* CTA */}
      <section
        className="py-20 md:py-28 px-8 md:px-16 lg:px-24 text-center"
        style={{ background: "hsl(50 14% 5%)" }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-4">
          Хотите так же?
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum leading-[0.95] mb-8 tracking-wide">
          ЗАКАЖИТЕ МОНТАЖ
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/services"
            className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-10 py-4 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-sm"
          >
            Услуги и цены
          </Link>
          <Link
            to="/#contacts"
            className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300 rounded-sm"
          >
            Оставить заявку
          </Link>
        </div>
      </section>

      <Footer />

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
