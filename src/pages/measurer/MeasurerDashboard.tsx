import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const demoRequests = [
  { id: "1", number: "REQ-002", status: "measurer_assigned" as RequestStatus, client_name: "Петрова А.С.", client_phone: "+7 900 222 33 44", client_address: "пр. Мира, 88, кв. 7", work_description: "Замер входной двери", agreed_date: "" },
  { id: "2", number: "REQ-003", status: "date_agreed" as RequestStatus, client_name: "Лебедев В.Г.", client_phone: "+7 900 999 00 11", client_address: "пр. Космонавтов, 55, кв. 17", work_description: "Замер входной и 2 межкомнатных", agreed_date: "2026-03-20" },
  { id: "3", number: "REQ-010", status: "date_agreed" as RequestStatus, client_name: "Козлов Д.М.", client_phone: "+7 900 333 44 55", client_address: "ул. Гагарина, 3, кв. 101", work_description: "Замер для перегородки", agreed_date: "2026-03-22" },
];

const MeasurerDashboard = () => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { document.title = "Мои заявки — Замерщик"; }, []);

  return (
    <DashboardLayout role="measurer" userName={user?.name}>
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
                    {r.work_description && <p className="text-slate-600">{r.work_description}</p>}
                    {r.agreed_date && (
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Дата замера: {r.agreed_date}</div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Замер выполнен
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

export default MeasurerDashboard;
