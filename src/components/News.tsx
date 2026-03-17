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

      <div className="px-4 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {news.map((n, i) => (
            <div
              key={i}
              className="group relative rounded-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(50 14% 12% / 0.9) 0%, hsl(50 14% 8% / 0.95) 100%)",
                boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px hsl(34 24% 48% / 0.15)",
              }}
            >
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src={n.image}
                  alt={n.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, hsl(50 14% 8%) 0%, transparent 60%)",
                  }}
                />
              </div>
              <div className="p-5 md:p-6">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-2">
                  {n.date}
                </p>
                <h3 className="font-display text-lg md:text-xl font-light text-doorium-platinum leading-tight mb-2 tracking-wide">
                  {n.title}
                </h3>
                <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed">
                  {n.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
