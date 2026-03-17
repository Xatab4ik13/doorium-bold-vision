import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Briefcase, Loader2, Plus, MapPin } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import RequestFilters, { type FilterState, defaultFilters } from "@/components/dashboard/RequestFilters";
import CreateRequestModal from "@/components/dashboard/CreateRequestModal";
import Pagination from "@/components/dashboard/Pagination";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";
import MobileRequestCard from "@/components/dashboard/MobileRequestCard";
import { useUsers, useRequests, type ApiRequest } from "@/hooks/useRequests";
import { usePaginatedRequests } from "@/hooks/usePaginatedRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { exportToCSV, exportToExcel } from "@/lib/exportRequests";
import { motion } from "framer-motion";

const quickFilters = [
  { label: "Все", value: "all", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Новые", value: "new", icon: <Clock className="w-4 h-4" /> },
  { label: "В работе", value: "in_progress", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Рекламации", value: "reclamation", icon: <AlertTriangle className="w-4 h-4" /> },
];

const ManagerDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { users, getUserName } = useUsers();
  const [city, setCity] = useState<CityFilter>("Москва");
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, city: "Москва" });
  const [quickFilter, setQuickFilter] = useState("all");
  const { requests, total, page, totalPages, limit, counts, loading, setPage, refetch } = usePaginatedRequests(filters, { quickFilter });
  const { createRequest, updateRequest } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { document.title = "Заявки — Менеджер"; }, []);

  const displayCounts = counts || { all: 0, new: 0, in_progress: 0, reclamation: 0 };

  const handleExport = (format: "csv" | "xlsx") => {
    if (format === "csv") exportToCSV(requests, getUserName);
    else exportToExcel(requests, getUserName);
  };

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(null);
    refetch();
  };

  const handleCreate = async (data: Partial<ApiRequest>) => {
    const created = await createRequest(data);
    refetch();
    return created;
  };

  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Все заявки</h1>
          <div className="flex items-center gap-3">
            <CityToggle value={city} onChange={(c) => { setCity(c); setFilters(f => ({ ...f, city: c })); }} />
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" /> Создать заявку
            </button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 flex-wrap">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                quickFilter === f.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-blue-400/40"
              }`}
            >
              {f.icon}
              {f.label}
              <span className="ml-1 text-xs opacity-70">
                {displayCounts[f.value as keyof typeof displayCounts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <RequestFilters value={filters} onChange={setFilters} users={users} onExport={handleExport} />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {isMobile ? (
              <div className="space-y-3">
                {requests.map((r, i) => (
                  <MobileRequestCard
                    key={r.id}
                    request={r}
                    index={i}
                    onClick={() => setSelectedRequest(r)}
                    getUserName={getUserName}
                  />
                ))}
                {requests.length === 0 && (
                  <p className="text-center text-slate-400 py-8 text-sm">Заявки не найдены</p>
                )}
              </div>
            ) : (
              <Card className="bg-white border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-3 font-medium text-slate-500">№</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Клиент</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Адрес</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Город</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Тип</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Статус</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Источник</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Исполнитель</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Межком.</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Входные</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Перег.</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Сумма</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelectedRequest(r)}
                          className="border-b border-slate-100 last:border-0 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.number}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{r.client_name}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{r.client_address || "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{r.city || "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{requestTypeLabels[r.type] || r.type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                              {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {r.partner_id ? (
                              <span className="text-purple-600 text-xs">{getUserName(r.partner_id) || "Партнёр"}</span>
                            ) : (
                              <span className="text-slate-400 text-xs">Сайт</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{getUserName(r.measurer_id) || getUserName(r.installer_id) || "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{r.interior_doors ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{r.entrance_doors ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{r.partitions ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{r.amount != null ? `${r.amount.toLocaleString("ru-RU")} ₽` : "—"}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{r.created_at?.split("T")[0]}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {requests.length === 0 && (
                  <p className="text-center text-slate-400 py-8 text-sm">Заявки не найдены</p>
                )}
              </Card>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={handleSave}
          viewerRole="manager"
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

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
