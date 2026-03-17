import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels } from "@/data/mockDashboard";
import { UserCheck, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const ManagerAssign = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const { getByRole, loading: usersLoading } = useUsers();
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [selectedExecutorId, setSelectedExecutorId] = useState("");

  useEffect(() => { document.title = "Распределение — Менеджер"; }, []);

  const unassigned = requests.filter((r) => !r.measurer_id && !r.installer_id && r.status === "new");
  const measurers = getByRole("measurer");
  const installers = getByRole("installer");

  const handleAssign = async () => {
    if (!selectedRequest || !selectedExecutorId) return;
    const executor = [...measurers, ...installers].find(u => u.id === selectedExecutorId);
    if (!executor) return;

    const updates: Partial<ApiRequest> = {};
    if (executor.role === "measurer") {
      (updates as any).status = "measurer_assigned";
      (updates as any).measurer_id = executor.id;
    } else {
      (updates as any).installer_id = executor.id;
    }

    try {
      await updateRequest(selectedRequest.id, updates);
      toast.success(`${selectedRequest.number} назначена → ${executor.name}`);
      setSelectedRequest(null);
      setSelectedExecutorId("");
    } catch {}
  };

  const isLoading = loading || usersLoading;

  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6" /> Распределение заявок
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unassigned requests */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  Нераспределённые
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unassigned.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unassigned.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Все заявки распределены 🎉</p>
                ) : (
                  unassigned.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => { setSelectedRequest(r); setSelectedExecutorId(""); }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRequest?.id === r.id
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-slate-100 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{r.number}</span>
                          <span className="text-xs font-medium text-slate-600">{requestTypeLabels[r.type] || r.type}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="text-sm font-medium text-slate-800 mt-1">{r.client_name}</div>
                      <div className="text-xs text-slate-400">{r.client_address}</div>
                      <div className="text-xs text-slate-300 mt-1">{r.created_at?.split("T")[0]}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Assignment panel */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base text-slate-900">Назначение</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedRequest ? (
                  <p className="text-sm text-slate-400 text-center py-8">Выберите заявку слева для назначения</p>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">{selectedRequest.number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRequest.status as keyof typeof statusColors] || "bg-gray-100 text-gray-500"}`}>
                          {statusLabels[selectedRequest.status as keyof typeof statusLabels] || selectedRequest.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-800">{selectedRequest.client_name}</div>
                      <div className="text-xs text-slate-400">{selectedRequest.client_address}</div>
                      <div className="text-xs text-slate-400">{selectedRequest.client_phone}</div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Замерщики</h4>
                      <div className="space-y-1">
                        {measurers.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedExecutorId(m.id)}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedExecutorId === m.id
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-slate-100 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-800">{m.name}</span>
                              {selectedExecutorId === m.id && <Check className="w-4 h-4 text-blue-600" />}
                            </div>
                          </button>
                        ))}
                        {measurers.length === 0 && (
                          <p className="text-xs text-slate-400 py-2">Нет активных замерщиков</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Монтажные бригады</h4>
                      <div className="space-y-1">
                        {installers.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => setSelectedExecutorId(inst.id)}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedExecutorId === inst.id
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-slate-100 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-800">{inst.name}</span>
                              {selectedExecutorId === inst.id && <Check className="w-4 h-4 text-blue-600" />}
                            </div>
                          </button>
                        ))}
                        {installers.length === 0 && (
                          <p className="text-xs text-slate-400 py-2">Нет активных бригад</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={!selectedExecutorId}
                      className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {selectedExecutorId
                        ? `Назначить → ${[...measurers, ...installers].find(u => u.id === selectedExecutorId)?.name}`
                        : "Выберите исполнителя"}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerAssign;
