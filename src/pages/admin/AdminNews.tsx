import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Article { id: string; title: string; slug: string; excerpt: string; image: string; content: string; created_at: string; read_time: string; }

const AdminNews = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  useEffect(() => {
    api("/api/articles")
      .then((data: any) => setArticles(Array.isArray(data) ? data : []))
      .catch((err: any) => toast.error(err.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      const created = await api("/api/articles", {
        method: "POST",
        body: { title: "Новая статья", slug: `new-${Date.now()}`, excerpt: "Описание...", content: "", read_time: "5 мин" },
        auth: true,
      });
      setArticles(p => [created, ...p]);
      toast.success("Статья создана");
      setEditingId(created.id);
      setEditTitle(created.title);
      setEditExcerpt(created.excerpt);
    } catch (err: any) {
      toast.error(err.message || "Ошибка создания");
    }
  };

  const handleSave = async (id: string) => {
    try {
      await api(`/api/articles/${id}`, { method: "PUT", body: { title: editTitle, excerpt: editExcerpt }, auth: true });
      setArticles(p => p.map(x => x.id === id ? { ...x, title: editTitle, excerpt: editExcerpt } : x));
      setEditingId(null);
      toast.success("Обновлено");
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/api/articles/${id}`, { method: "DELETE", auth: true });
      setArticles(p => p.filter(x => x.id !== id));
      toast.success("Удалено");
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.name}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-slate-900">Новости</h1><button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><PlusCircle className="w-4 h-4" />Создать статью</button></div>
        {articles.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Статей пока нет</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(a => (
              <Card key={a.id} className="bg-white border-slate-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {a.image ? <img src={a.image} alt={a.title} className="w-full h-full object-cover" /> : <span className="text-4xl opacity-30">📰</span>}
                </div>
                <CardContent className="pt-4 space-y-2">
                  {editingId === a.id ? (
                    <div className="space-y-2">
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <textarea value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <button onClick={() => handleSave(a.id)} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Сохранить</button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{a.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{a.excerpt}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleDateString("ru-RU") : ""} · {a.read_time}</span>
                        <div className="flex gap-1"><button onClick={() => { setEditingId(a.id); setEditTitle(a.title); setEditExcerpt(a.excerpt); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default AdminNews;
