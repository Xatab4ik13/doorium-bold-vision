import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Search, Plus, Phone, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const demoRequests = [
  { id: "1", number: "REQ-001", type: "measurement" as RequestType, status: "new" as RequestStatus, client_name: "Иванов И.И.", client_phone: "+7 900 111 22 33", client_address: "ул. Ленина, 15, кв. 42", created_at: "2026-03-17" },
  { id: "2", number: "REQ-002", type: "measurement" as RequestType, status: "mesurer_assigned" as RequestStatus, client_name: "Петрова А.С.", client_phone: "+7 900 222 33 44", client_address: "пр. Мира, 88", created_at: "2026-03-16" },
  { id: "3", number: "REQ-004", type: "installation" as RequestType, status: "new" as RequestStatus, client_name: "Егорова Т.Л.", client_phone: "+7 900 000 11 22", client_address: "ул. Центральная, 1", created_at: "2026-03-15" },
  { id: "4", number: "REQ-006", type: "reclamation" as RequestType, status: "new" as RequestStatus, client_name: "Волкова М.И.", client_phone: "+7 900 666 77 88", client_address: "ул. Советская, 44", created_at: "2026-03-14" },
  { id: "5", number: "REQ-009", type: "measurement" as RequestType, status: "pending" as RequestStatus, client_name: "Соколова Н.Р.", client_phone: "+7 900 888 99 00", client_address: "ул. Парковая, 19", created_at: "2026-03-12" },
];

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { document.title = "Заявки — Менеджер"; }, []);

  const filtered = demoRequests.filter(r => !search || r.client_name.toLowerCase().includes(search.toLowerCase()) || r.number.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Заявки</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Новая
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="bg-white border-slate-200 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">{r.number}</span>
                      <span className="text-xs font-medium text-slate-600">{requestTypeLabels[r.type]}</span>
                    </div>
                    <div className="font-medium text-slate-800">{r.client_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.client_address}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-500"}`}>
                    {statusLabels[r.status] || r.status}
                  </span>
                </div>
                {selectedId === r.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {r.client_phone}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {r.created_at}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
