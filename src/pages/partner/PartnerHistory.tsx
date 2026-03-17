import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRequests } from "@/hooks/useRequests";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { History, Loader2 } from "lucide-react";

const PartnerHistory = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();

  const closedRequests = requests.filter((r) => r.status === "closed");

  return (
    <DashboardLayout role="partner" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">История заявок</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : closedRequests.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <History className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm">Нет завершённых заявок</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {closedRequests.map((r) => (
              <Card key={r.id} className="bg-white border-slate-200">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-slate-400">{r.number}</span>
                      <span className="ml-2 text-xs text-slate-500">{requestTypeLabels[r.type]}</span>
                      <span className="ml-2 text-sm text-slate-700">{r.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[r.status as RequestStatus] || r.status}
                      </span>
                      <span className="text-xs text-slate-300">{r.created_at?.split("T")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default PartnerHistory;
