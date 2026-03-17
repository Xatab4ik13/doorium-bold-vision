import { useState } from "react";
import { X, Save } from "lucide-react";
import type { Article } from "@/data/articles";

interface ArticleEditorModalProps {
  article?: Article;
  onClose: () => void;
  onSave: (data: { title: string; slug: string; excerpt: string; content: string; readTime: string }) => void;
}

const ArticleEditorModal = ({ article, onClose, onSave }: ArticleEditorModalProps) => {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [readTime, setReadTime] = useState(article?.readTime || "5 мин");

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const handleSubmit = () => {
    if (!title.trim() || !slug.trim()) return;
    onSave({ title, slug, excerpt, content, readTime });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold">{article ? "Редактировать" : "Новая статья"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заголовок</label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!article) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zа-яё0-9-]/gi, "")); }} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Описание</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass + " resize-none"} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Контент</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className={inputClass + " resize-none"} />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent">Отмена</button>
          <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground flex items-center gap-2"><Save size={16} /> Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorModal;
