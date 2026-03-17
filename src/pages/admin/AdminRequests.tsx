import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Plus, Loader2 } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import RequestFilters, { type FilterState, defaultFilters } from "@/components/dashboard/RequestFilters";
import CreateRequestModal from "@/components/dashboard/CreateRequestModal";
import Pagination from "@/components/dashboard/Pagination";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";
import MobileRequestCard from "@/components/dashboard/MobileRequestCard";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { exportToCSV, exportToExcel } from "@/lib/exportRequests";

const ITEMS_PER_PAGE = 10;

const AdminRequests = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const quickFromUrl = searchParams.get("quick") || undefined;
  const [city, setCity] = useState<CityFilter>("Москва");
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, city: "Москва" });
  const { requests, loading, fetchRequests, updateRequest, createRequest, deleteRequest } = useRequests();
  const { users, getUserName } = useUsers();
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = "Заявки — Админ-панель"; }, []);

  const filtered = useMemo(() => {
    let result = [...requests];

    if (quickFromUrl === "new") result = result.filter(r => r.status === "new");
    else if (quickFromUrl === "pending") result = result.filter(r => r.status === "pending");
    else if (quickFromUrl === "in_progress") result = result.filter(r => !["new", "closed", "cancelled"].includes(r.status));
    else if (quickFromUrl === "closed") result = result.filter(r => r.status === "closed");
    else if (quickFromUrl === "reclamation") result = result.filter(r => r.type === "reclamation");

    if (city) result = result.filter(r => r.city === city);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r =>
        r.client_name.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        (r.client_address || "").toLowerCase().includes(q)
      );
    }

    if (filters.status !== "all") result = result.filter(r => r.status === filters.status);
    if (filters.type !== "all") result = result.filter(r => r.type === filters.type);
    if (filters.measurerId !== "all") result = result.filter(r => r.measurer_id === filters.measurerId);
    if (filters.installerId !== "all") result = result.filter(r => r.installer_id === filters.installerId);

    return result;
  }, [requests, quickFromUrl, city, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCreate = async (data: Partial<ApiRequest>) => {
    const created = await createRequest(data);
    return created;
  };

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(null);
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
  };

  const handleExport = (format: "csv" | "xlsx") => {
    if (format === "csv") exportToCSV(filtered, getUserName);
    else exportToExcel(filtered, getUserName);
  };

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Заявки</h1>
          <div className="flex items-center gap-3">
            <CityToggle value={city} onChange={(c) => { setCity(c); setPage(1); }} />
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              Создать заявку
            </button>
          </div>
        </div>

        <RequestFilters
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(1); }}
          users={users}
          onExport={handleExport}
          resultCount={filtered.length}
        />

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : (
          <Card className="bg-white border-slate-200 overflow-hidden">
            {isMobile ? (
              <div className="p-3 space-y-2">
                {paged.map((r, i) => (
                  <MobileRequestCard key={r.id} request={r} index={i} onClick={() => setSelectedRequest(r)} getUserName={getUserName} />
                ))}
                {paged.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Заявки не найдены</div>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">№</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Клиент</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Телефон</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Адрес</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Город</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Тип</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Источник</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Исполнитель</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Межком.</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Входные</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Сумма</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRequest(r)}
                        className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.number}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.client_name}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{r.client_phone}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{r.client_address || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{r.city || "—"}</td>
                        <td className="px-4 py-3 text-xs">{requestTypeLabels[r.type] || r.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus]}`}>
                            {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {r.partner_id ? (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">{getUserName(r.partner_id) || "Партнёр"}</span>
                          ) : (
                            <span className="text-slate-400">Сайт</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{getUserName(r.measurer_id) || getUserName(r.installer_id) || "—"}</td>
                        <td className="px-4 py-3 text-xs text-center">{r.interior_doors ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-center">{r.entrance_doors ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">{r.amount != null ? `${r.amount.toLocaleString("ru-RU")} ₽` : "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{r.created_at?.split("T")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paged.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Заявки не найдены</div>}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={ITEMS_PER_PAGE} onPageChange={setPage} />
          </Card>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          viewerRole="admin"
          onSendToInstallation={async (req) => {
            await handleCreate({ type: "installation", client_name: req.client_name, client_phone: req.client_phone, client_address: req.client_address, city: req.city });
          }}
        />
      )}

      {showCreate && <CreateRequestModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </DashboardLayout>
  );
};

export default AdminRequests;
