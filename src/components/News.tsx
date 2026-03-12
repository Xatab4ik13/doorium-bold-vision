import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import newsImg1 from "@/assets/news-placeholder-1.jpg";
import newsImg2 from "@/assets/news-placeholder-2.jpg";
import newsImg3 from "@/assets/news-placeholder-3.jpg";

const news = [
  {
    image: newsImg1,
    date: "28 февраля 2026",
    title: "Новый сезон монтажа: обновлённые стандарты установки",
    excerpt: "Мы внедрили улучшенные технологии монтажа, обеспечивающие ещё более точную геометрию и долговечность.",
  },
  {
    image: newsImg2,
    date: "15 февраля 2026",
    title: "Расширение шоурума: коллекция входных дверей",
    excerpt: "В нашем шоуруме появились новые модели входных дверей от ведущих производителей.",
  },
  {
    image: newsImg3,
    date: "3 января 2026",
    title: "Итоги года: 12 000 установленных дверей за 2025",
    excerpt: "Подводим итоги рекордного года и делимся планами на будущее.",
  },
];

const News = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % news.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + news.length) % news.length), []);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) diff > 0 ? prev() : next();
    setTouchStart(null);
  };

  const item = news[current];

  return (
    <section
      id="news"
      className="relative py-20 md:py-28"
      style={{ background: "hsl(50 14% 5%)" }}
    >
      <div className="px-8 md:px-16 lg:px-24 mb-10 md:mb-14">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Последнее
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum leading-[0.95] tracking-wide">
          НОВОСТИ
        </h2>
      </div>

      {/* Full-width slider */}
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full" style={{ aspectRatio: "21/9" }}>
          {news.map((n, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? "scale(1)" : "scale(1.03)",
              }}
            >
              <img
                src={n.image}
                alt={n.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, hsl(50 14% 5% / 0.8) 0%, hsl(50 14% 5% / 0.4) 40%, transparent 70%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, hsl(50 14% 5% / 0.6) 0%, transparent 40%)",
                }}
              />
            </div>
          ))}

          {/* Text overlay */}
          <div className="absolute inset-0 z-10 flex items-end md:items-center px-8 md:px-16 lg:px-24 pb-16 md:pb-0">
            <div className="max-w-lg">
              <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-2">
                {item.date}
              </p>
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-doorium-platinum leading-tight mb-3 tracking-wide">
                {item.title}
              </h3>
              <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed max-w-sm">
                {item.excerpt}
              </p>
            </div>
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-doorium-platinum/20 flex items-center justify-center text-doorium-platinum/50 hover:text-primary hover:border-primary/50 transition-all duration-300"
            aria-label="Предыдущая"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-doorium-platinum/20 flex items-center justify-center text-doorium-platinum/50 hover:text-primary hover:border-primary/50 transition-all duration-300"
            aria-label="Следующая"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {news.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-doorium-platinum/20 hover:bg-doorium-platinum/40"
              }`}
              aria-label={`Новость ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
