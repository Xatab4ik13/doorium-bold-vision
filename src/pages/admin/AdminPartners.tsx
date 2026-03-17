import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Search, Handshake, Eye } from "lucide-react";

const demoPartners = [
  { id: 1, name: "Алексей Петров", store_name: "ООО РемонтПро", store_address: "ул. Строителей, 10", phone: "+7 900 111 22 33", email: "petrov@example.com", status: "done", created_at: "2025-01-10" },
  { id: 2, name: "Игорь Строев", store_name: "ИП Строев", store_address: "пр. Мира, 55", phone: "+7 900 222 33 44", email: "stroev@example.com", status: "done", created_at: "2025-02-01" },
  { id: 3, name: "Мария Козлова", store_name: "Двери Люкс", store_address: "ул. Ленина, 88", phone: "+7 900 333 44 55", email: "kozlova@example.com", status: "new", created_at: "2026-03-15" },
  { id: 4, name: "Дмитрий Волков", store_name: "СтройМаркет", store_address: "ул. Советская, 12", phone: "+7 900 444 55 66", email: "volkov@example.com", status: "in_progress", created_at: "2026-03-10" },
];

const statusLabels: Record<string, string> = { new: "Новая", in_progress: "В работе", done: "Завершена", rejected: "Отклонена" };
const statusColors: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", done: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

const AdminPartners = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "Партнёры — Админ-панель"; }, []);

  const filtered = demoPartners.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.store_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Handshake className="w-6 h-6" /> Партнёры
          </h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <Card className="bg-white border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Контакт</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Магазин</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{p.store_name}</div>
                      <div className="text-xs text-slate-400">{p.store_address}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{p.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPartners;
