import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { articles } from "@/data/articles";

const News = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const latestArticle = articles[articles.length - 1] || articles[0];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="news" className="relative" style={{ background: "hsl(50 14% 5%)" }}>
      <div ref={ref}>
        <Link
          to={`/news/${latestArticle.slug}`}
          className="group block relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, hsl(50 14% 8%) 0%, hsl(50 14% 10%) 50%, hsl(50 14% 8%) 100%)",
            borderTop: "1px solid hsl(34 24% 48% / 0.12)",
            borderBottom: "1px solid hsl(34 24% 48% / 0.12)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-5 md:py-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-40px)",
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}
          >
            <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
              <span className="font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-primary shrink-0">
                Новость
              </span>
              <div className="h-4 w-px bg-primary/30 shrink-0 hidden md:block" />
              <h3 className="font-display text-sm md:text-lg font-light text-doorium-platinum/80 leading-tight tracking-wide truncate group-hover:text-primary transition-colors duration-300">
                {latestArticle.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <span className="font-body text-[10px] md:text-xs text-doorium-platinum/30 hidden md:block">
                {latestArticle.date}
              </span>
              <span
                className="font-body text-xs tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
              >
                Читать →
              </span>
            </div>
          </div>

          {/* Animated shine effect on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(34 24% 48% / 0.05) 50%, transparent 100%)",
            }}
          />
        </Link>
      </div>
    </section>
  );
};

export default News;
