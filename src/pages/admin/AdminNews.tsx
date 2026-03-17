import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { demoArticles } from "@/data/demoData";

interface Article { id: string; title: string; slug: string; excerpt: string; image: string; content: string; date: string; readTime: string; }

const AdminNews = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>(demoArticles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  const handleCreate = () => {
    const a: Article = { id: `a${Date.now()}`, title: "Новая статья", slug: `new-${Date.now()}`, excerpt: "Описание...", image: "", content: "", date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }), readTime: "5 мин" };
    setArticles(p => [a, ...p]); toast.success("Статья создана"); setEditingId(a.id); setEditTitle(a.title); setEditExcerpt(a.excerpt);
  };

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-slate-900">Новости</h1><button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><PlusCircle className="w-4 h-4" />Создать статью</button></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => (
            <Card key={a.id} className="bg-white border-slate-200 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"><span className="text-4xl opacity-30">📰</span></div>
              <CardContent className="pt-4 space-y-2">
                {editingId === a.id ? (
                  <div className="space-y-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <textarea value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <button onClick={() => { setArticles(p => p.map(x => x.id === a.id ? { ...x, title: editTitle, excerpt: editExcerpt } : x)); setEditingId(null); toast.success("Обновлено"); }} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Сохранить</button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{a.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center justify-between pt-2"><span className="text-xs text-slate-400">{a.date} · {a.readTime}</span>
                      <div className="flex gap-1"><button onClick={() => { setEditingId(a.id); setEditTitle(a.title); setEditExcerpt(a.excerpt); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button><button onClick={() => { setArticles(p => p.filter(x => x.id !== a.id)); toast.success("Удалено"); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminNews;
