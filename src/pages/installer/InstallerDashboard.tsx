import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, CheckCircle2, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const demoRequests = [
  { id: "1", number: "REQ-005", status: "date_agreed" as RequestStatus, client_name: "Михайлова Е.В.", client_phone: "+7 900 444 55 66", client_address: "ул. Пушкина, 22, кв. 5", work_description: "Монтаж входной двери с электрозамком", agreed_date: "2026-03-21" },
  { id: "2", number: "REQ-011", status: "date_agreed" as RequestStatus, client_name: "Сергеев А.П.", client_phone: "+7 900 111 00 22", client_address: "ул. Мичурина, 8, кв. 15", work_description: "Монтаж 2 межкомнатных дверей", agreed_date: "2026-03-22" },
];

const InstallerDashboard = () => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { document.title = "Мои заявки — Монтажник"; }, []);

  return (
    <DashboardLayout role="installer" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Мои заявки</h1>
        <p className="text-sm text-slate-500">Активных заявок: {demoRequests.length}</p>

        <div className="space-y-3">
          {demoRequests.map((r) => (
            <Card key={r.id} className={`bg-white border-slate-200 cursor-pointer transition-all ${selectedId === r.id ? "ring-2 ring-blue-500/30" : "hover:shadow-sm"}`} onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-slate-400">{r.number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                    {statusLabels[r.status]}
                  </span>
                </div>
                <div className="font-medium text-slate-800 mb-1">{r.client_name}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" /> {r.client_address}
                </div>

                {selectedId === r.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {r.client_phone}</div>
                    <p className="text-slate-600">{r.work_description}</p>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Дата монтажа: {r.agreed_date}</div>
                    <div className="flex gap-2 pt-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" /> Загрузить фото
                      </button>
                      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Монтаж завершён
                      </button>
                    </div>
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

export default InstallerDashboard;
