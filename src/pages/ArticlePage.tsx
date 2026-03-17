import { useEffect, forwardRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { articles } from "@/data/articles";
import { ArrowLeft } from "lucide-react";

/** Simple markdown-ish → HTML converter */
function renderContent(raw: string): string {
  const lines = raw.trim().split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Close lists if we hit a non-list line
    if (inUl && !trimmed.startsWith("- ")) { out.push("</ul>"); inUl = false; }
    if (inOl && !/^\d+\.\s/.test(trimmed)) { out.push("</ol>"); inOl = false; }

    if (!trimmed) {
      continue; // skip blank lines
    } else if (trimmed.startsWith("### ")) {
      out.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      out.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("- ")) {
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inOl) { out.push("<ol>"); inOl = true; }
      const text = trimmed.replace(/^\d+\.\s/, "");
      out.push(`<li>${text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`);
    } else {
      out.push(`<p>${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }

  if (inUl) out.push("</ul>");
  if (inOl) out.push("</ol>");
  return out.join("\n");
}

const ArticlePage = forwardRef<HTMLDivElement>((_, ref) => {
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
      <div ref={ref} className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
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
    <div ref={ref} className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      <article className="pt-36 md:pt-44 pb-20 md:pb-28 px-8 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/#news"
            className="inline-flex items-center gap-1.5 text-primary font-body text-sm mb-8 hover:underline"
          >
            <ArrowLeft size={14} /> Назад к новостям
          </Link>

          <div className="mb-10">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-3">
              {article.date} · {article.readTime}
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-doorium-platinum leading-tight tracking-wide">
              {article.title}
            </h1>
          </div>

          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:font-light prose-headings:tracking-wide prose-headings:text-doorium-platinum
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-5
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:font-body prose-p:text-doorium-platinum/80 prose-p:leading-[1.85] prose-p:text-[15px] prose-p:md:text-base prose-p:mb-5
              prose-li:font-body prose-li:text-doorium-platinum/80 prose-li:text-[15px] prose-li:md:text-base prose-li:leading-[1.85]
              prose-strong:text-doorium-platinum prose-strong:font-semibold
              prose-ul:space-y-2 prose-ul:pl-1
              prose-ol:space-y-2 prose-ol:pl-1
            "
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
          />
        </div>
      </article>

      <Footer />
    </div>
  );
});

ArticlePage.displayName = "ArticlePage";

export default ArticlePage;
