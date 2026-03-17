import { Link } from "react-router-dom";
import { articles } from "@/data/articles";

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
          {articles.map((n, i) => (
            <Link
              key={i}
              to={`/news/${n.slug}`}
              className="group relative rounded-lg overflow-hidden block"
              style={{
                background: "linear-gradient(135deg, hsl(50 14% 12% / 0.9) 0%, hsl(50 14% 8% / 0.95) 100%)",
                boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px hsl(34 24% 48% / 0.15)",
              }}
            >
              <div className="p-6 md:p-8">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-3">
                  {n.date} · {n.readTime}
                </p>
                <h3 className="font-display text-lg md:text-xl font-light text-doorium-platinum leading-tight mb-3 tracking-wide group-hover:text-primary transition-colors duration-300">
                  {n.title}
                </h3>
                <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed">
                  {n.excerpt}
                </p>
                <span className="inline-block mt-4 font-body text-xs tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary transition-colors">
                  Читать →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
