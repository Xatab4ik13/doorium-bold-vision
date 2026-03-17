import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Search, Download, Plus, Loader2, ChevronRight, MapPin, Calendar, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Demo data
const demoRequests = [
  { id: "1", number: "REQ-001", type: "measurement" as RequestType, status: "new" as RequestStatus, client_name: "Иванов Иван Иванович", client_phone: "+7 900 111 22 33", client_address: "ул. Ленина, 15, кв. 42", city: "Москва", work_description: "Замер межкомнатных дверей, 3 проёма", created_at: "2026-03-17" },
  { id: "2", number: "REQ-002", type: "measurement" as RequestType, status: "measurer_assigned" as RequestStatus, client_name: "Петрова Анна Сергеевна", client_phone: "+7 900 222 33 44", client_address: "пр. Мира, 88, кв. 7", city: "Москва", work_description: "Замер входной двери", created_at: "2026-03-16", measurer: "Сидоров К.В." },
  { id: "3", number: "REQ-003", type: "measurement" as RequestType, status: "date_agreed" as RequestStatus, client_name: "Лебедев Виктор Геннадьевич", client_phone: "+7 900 999 00 11", client_address: "пр. Космонавтов, 55, кв. 17", city: "СПб", work_description: "Замер входной и 2 межкомнатных дверей", created_at: "2026-03-15", agreed_date: "2026-03-20" },
  { id: "4", number: "REQ-004", type: "installation" as RequestType, status: "new" as RequestStatus, client_name: "Егорова Татьяна Леонидовна", client_phone: "+7 900 000 11 22", client_address: "ул. Центральная, 1, кв. 99", city: "Москва", work_description: "Монтаж 3 межкомнатных дверей", created_at: "2026-03-15" },
  { id: "5", number: "REQ-005", type: "installation" as RequestType, status: "date_agreed" as RequestStatus, client_name: "Михайлова Елена Владимировна", client_phone: "+7 900 444 55 66", client_address: "ул. Пушкина, 22, кв. 5", city: "Москва", work_description: "Монтаж входной двери с электрозамком", created_at: "2026-03-14", agreed_date: "2026-03-21" },
  { id: "6", number: "REQ-006", type: "reclamation" as RequestType, status: "new" as RequestStatus, client_name: "Волкова Марина Игоревна", client_phone: "+7 900 666 77 88", client_address: "ул. Советская, 44, кв. 12", city: "СПб", work_description: "Скрипит дверь после монтажа", created_at: "2026-03-14" },
  { id: "7", number: "REQ-007", type: "measurement" as RequestType, status: "closed" as RequestStatus, client_name: "Кузнецов Павел Петрович", client_phone: "+7 900 777 88 99", client_address: "ул. Лесная, 7, кв. 2", city: "Москва", work_description: "Замер для 5 межкомнатных дверей", created_at: "2026-03-10" },
  { id: "8", number: "REQ-008", type: "installation" as RequestType, status: "closed" as RequestStatus, client_name: "Новиков Алексей Александрович", client_phone: "+7 900 555 66 77", client_address: "пр. Победы, 10, кв. 33", city: "Москва", work_description: "Монтаж 4 межкомнатных дверей", created_at: "2026-03-08" },
  { id: "9", number: "REQ-009", type: "measurement" as RequestType, status: "pending" as RequestStatus, client_name: "Соколова Наталья Романовна", client_phone: "+7 900 888 99 00", client_address: "ул. Парковая, 19, кв. 8", city: "Москва", work_description: "Замер 2 дверей с фрамугой", created_at: "2026-03-12" },
  { id: "10", number: "REQ-010", type: "measurement" as RequestType, status: "measurement_done" as RequestStatus, client_name: "Козлов Дмитрий Михайлович", client_phone: "+7 900 333 44 55", client_address: "ул. Гагарина, 3, кв. 101", city: "СПб", work_description: "Замер для перегородки", created_at: "2026-03-11" },
];

type QuickFilter = "all" | "new" | "in_progress" | "closed" | "reclamation";

const AdminRequests = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { document.title = "Заявки — Админ-панель"; }, []);

  const filtered = demoRequests.filter((r) => {
    const matchSearch = !search || 
      r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client_address.toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;
    if (quickFilter === "new") matchFilter = r.status === "new";
    else if (quickFilter === "in_progress") matchFilter = !["new", "closed", "cancelled"].includes(r.status);
    else if (quickFilter === "closed") matchFilter = r.status === "closed";
    else if (quickFilter === "reclamation") matchFilter = r.type === "reclamation";

    return matchSearch && matchFilter;
  });

  const quickFilters: { label: string; value: QuickFilter; count: number }[] = [
    { label: "Все", value: "all", count: demoRequests.length },
    { label: "Новые", value: "new", count: demoRequests.filter(r => r.status === "new").length },
    { label: "В работе", value: "in_progress", count: demoRequests.filter(r => !["new", "closed", "cancelled"].includes(r.status)).length },
    { label: "Закрыты", value: "closed", count: demoRequests.filter(r => r.status === "closed").length },
    { label: "Рекламации", value: "reclamation", count: demoRequests.filter(r => r.type === "reclamation").length },
  ];

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Заявки</h1>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Новая заявка
            </button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 flex-wrap">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === f.value
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.label} <span className="ml-1 text-xs opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени, номеру или адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <Card className="bg-white border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">№</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Тип</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Клиент</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Адрес</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${
                      selectedId === r.id ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.number}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{requestTypeLabels[r.type]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-slate-800">{r.client_name}</div>
                        <div className="text-xs text-slate-400">{r.client_phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">{r.client_address}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {getStatusLabel(r.status, r.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Заявки не найдены
            </div>
          )}
        </Card>

        {/* Detail panel */}
        {selectedId && (() => {
          const r = demoRequests.find(x => x.id === selectedId);
          if (!r) return null;
          return (
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{r.number} — {r.client_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                    {getStatusLabel(r.status, r.type)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500">Телефон</div>
                      <div className="font-medium text-slate-800">{r.client_phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500">Адрес</div>
                      <div className="font-medium text-slate-800">{r.client_address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500">Дата создания</div>
                      <div className="font-medium text-slate-800">{r.created_at}</div>
                    </div>
                  </div>
                  {r.work_description && (
                    <div className="md:col-span-2">
                      <div className="text-slate-500">Описание</div>
                      <div className="font-medium text-slate-800">{r.work_description}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </DashboardLayout>
  );
};

export default AdminRequests;
