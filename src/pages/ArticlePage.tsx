import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { articles } from "@/data/articles";
import { ArrowLeft } from "lucide-react";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Doorium Service`;
    }
    window.scrollTo(0, 0);
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
        <Header />
        <div className="pt-40 pb-20 px-8 md:px-16 lg:px-24 text-center">
          <h1 className="font-display text-4xl text-doorium-platinum mb-4">Статья не найдена</h1>
          <Link to="/" className="text-primary font-body text-sm hover:underline">← На главную</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      <article className="pt-36 md:pt-44 pb-20 md:pb-28 px-8 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/#news"
            className="inline-flex items-center gap-1.5 text-primary font-body text-sm mb-8 hover:underline"
          >
            <ArrowLeft size={14} /> Назад к новостям
          </Link>

          <div className="mb-8">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-3">
              {article.date} · {article.readTime}
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-doorium-platinum leading-tight tracking-wide">
              {article.title}
            </h1>
          </div>

          <div
            className="prose prose-invert max-w-none
              prose-headings:font-display prose-headings:font-light prose-headings:tracking-wide prose-headings:text-doorium-platinum
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:font-body prose-p:text-doorium-platinum/70 prose-p:leading-relaxed prose-p:text-base
              prose-li:font-body prose-li:text-doorium-platinum/70 prose-li:text-base
              prose-strong:text-doorium-platinum prose-strong:font-medium
              prose-ul:space-y-1
              prose-ol:space-y-1
            "
            dangerouslySetInnerHTML={{
              __html: article.content
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^- (.*)/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
                .replace(/^(\d+)\. (.*)/gm, '<li>$2</li>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hul])/gm, (line) => line ? `<p>${line}` : '')
                .replace(/<p><\/p>/g, '')
            }}
          />
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ArticlePage;
