import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { MapPin, Calendar, Search, Loader2, CheckCircle2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";

const PartnerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest, createRequest } = useRequests();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchFromUrl);
  const [filterType, setFilterType] = useState<"all" | RequestType>("all");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase().replace(/\s/g, "");
    const matchSearch = r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.client_address || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.client_phone || "").replace(/\s/g, "").includes(q);
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const activeRequests = filtered.filter((r) => r.status !== "closed");
  const closedRequests = filtered.filter((r) => r.status === "closed");

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <DashboardLayout role="partner" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Мои заявки</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            placeholder="Поиск по клиенту, адресу, номеру..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all" as const, label: "Все" },
            { value: "measurement" as const, label: "Замер" },
            { value: "installation" as const, label: "Монтаж" },
            { value: "reclamation" as const, label: "Рекламация" },
          ]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeRequests.length === 0 && closedRequests.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Заявок не найдено</p>
            )}

            {activeRequests.map((r) => (
              <Card
                key={r.id}
                className="bg-white border-slate-200 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(r)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{r.number}</span>
                      <span className="text-xs font-medium text-slate-600">{requestTypeLabels[r.type] || r.type}</span>
                    </div>
                  </div>
                  <div className="font-medium text-slate-800">{r.client_name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {r.client_address}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                      {statusLabels[r.status as RequestStatus] || r.status}
                    </span>
                    <span className="text-xs text-slate-300">{r.created_at?.split("T")[0]}</span>
                  </div>
                  <div className="text-xs text-purple-500 mt-1">Исполнитель: Doorium Service</div>
                </CardContent>
              </Card>
            ))}

            {closedRequests.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-slate-700 mt-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Завершённые
                </h2>
                {closedRequests.map((r) => (
                  <Card
                    key={r.id}
                    className="bg-white border-slate-200 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedRequest(r)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-400">{r.number}</span>
                        <span className="text-xs text-slate-500">{r.client_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                          {statusLabels[r.status as RequestStatus] || r.status}
                        </span>
                        <span className="text-xs text-slate-300">{r.created_at?.split("T")[0]}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={handleSave}
          viewerRole="partner"
          onSendToInstallation={async (req) => {
            await createRequest({
              type: "installation",
              client_name: req.client_name,
              client_phone: req.client_phone,
              client_address: req.client_address,
              city: req.city,
              extra_name: req.extra_name,
              extra_phone: req.extra_phone,
              work_description: req.work_description,
              notes: req.notes,
              photos: req.photos,
              source: req.source,
              partner_id: req.partner_id,
            });
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default PartnerDashboard;
