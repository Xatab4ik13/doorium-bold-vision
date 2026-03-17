import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Edit, Eye, Newspaper } from "lucide-react";

const demoNews = [
  { id: "1", title: "Новая коллекция межкомнатных дверей", excerpt: "Представляем линейку дверей из массива дуба с отделкой шпоном.", date: "15 марта 2026", readTime: "3 мин" },
  { id: "2", title: "Акция на входные двери", excerpt: "Скидка 15% на все модели входных дверей до конца месяца.", date: "10 марта 2026", readTime: "2 мин" },
  { id: "3", title: "Расширение зоны обслуживания", excerpt: "Теперь мы работаем также в Московской области и Санкт-Петербурге.", date: "5 марта 2026", readTime: "4 мин" },
];

const AdminNews = () => {
  const { user } = useAuth();

  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Новости</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Новая статья
          </button>
        </div>

        <div className="space-y-3">
          {demoNews.map((article) => (
            <Card key={article.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{article.date}</span>
                      <span>·</span>
                      <span>{article.readTime} чтения</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNews;
