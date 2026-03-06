import { useEffect, useRef } from "react";
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

const NewsCard = ({ item, index }: { item: typeof news[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group cursor-pointer"
      style={{
        opacity: 0,
        transform: "translateY(40px)",
        transition: `opacity 0.8s ease-out ${index * 0.15}s, transform 0.8s ease-out ${index * 0.15}s`,
      }}
    >
      <div className="relative overflow-hidden mb-5">
        <img
          src={item.image}
          alt={item.title}
          className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-doorium-smoky/20 group-hover:bg-doorium-smoky/0 transition-colors duration-500" />
      </div>

      <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-2">
        {item.date}
      </p>
      <h3 className="font-display text-lg md:text-xl text-doorium-platinum leading-tight mb-2 group-hover:text-primary transition-colors duration-500">
        {item.title}
      </h3>
      <p className="font-body text-sm text-muted-foreground leading-relaxed">
        {item.excerpt}
      </p>
    </div>
  );
};

const News = () => {
  return (
    <section
      id="news"
      className="relative py-24 md:py-32"
      style={{
        background: "linear-gradient(to bottom, hsl(70 7% 16%) 0%, hsl(60 8% 13%) 30%, hsl(50 14% 8%) 60%, hsl(50 14% 8%) 100%)",
      }}
    >
      <div className="relative z-10 px-8 md:px-16 lg:px-24 mb-16 md:mb-20">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Последнее
        </p>
        <h2 className="font-display-stencil text-4xl md:text-5xl lg:text-6xl text-doorium-platinum leading-[0.95]">
          НОВОСТИ
        </h2>
      </div>

      <div className="relative z-10 px-8 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {news.map((item, i) => (
          <NewsCard key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};

export default News;
