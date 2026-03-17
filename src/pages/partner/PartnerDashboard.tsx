import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Search, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const demoRequests = [
  { id: "1", number: "REQ-P01", type: "measurement" as RequestType, status: "new" as RequestStatus, client_name: "Клиент от партнёра 1", client_phone: "+7 900 100 20 30", client_address: "ул. Строителей, 5", created_at: "2026-03-17" },
  { id: "2", number: "REQ-P02", type: "installation" as RequestType, status: "date_agreed" as RequestStatus, client_name: "Клиент от партнёра 2", client_phone: "+7 900 200 30 40", client_address: "пр. Мира, 12", created_at: "2026-03-15", agreed_date: "2026-03-22" },
  { id: "3", number: "REQ-P03", type: "measurement" as RequestType, status: "closed" as RequestStatus, client_name: "Клиент от партнёра 3", client_phone: "+7 900 300 40 50", client_address: "ул. Ленина, 77", created_at: "2026-03-10" },
];

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  const active = demoRequests.filter(r => r.status !== "closed" && r.status !== "cancelled");
  const filtered = active.filter(r => !search || r.client_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="partner" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Мои заявки</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="bg-white border-slate-200 hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{r.number}</span>
                    <span className="text-xs font-medium">{requestTypeLabels[r.type]}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                </div>
                <div className="font-medium text-slate-800">{r.client_name}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1"><MapPin className="w-3.5 h-3.5" /> {r.client_address}</div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Нет активных заявок</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
