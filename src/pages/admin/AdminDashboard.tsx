import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";

// Demo data
const demoRequests = [
  { id: "1", status: "new", type: "measurement", client_name: "Иванов И.И.", created_at: "2026-03-17" },
  { id: "2", status: "new", type: "installation", client_name: "Петрова А.С.", created_at: "2026-03-17" },
  { id: "3", status: "new", type: "measurement", client_name: "Сидоров К.В.", created_at: "2026-03-16" },
  { id: "4", status: "pending", type: "measurement", client_name: "Козлов Д.М.", created_at: "2026-03-16" },
  { id: "5", status: "pending", type: "installation", client_name: "Волкова М.И.", created_at: "2026-03-15" },
  { id: "6", status: "measurer_assigned", type: "measurement", client_name: "Лебедев В.Г.", created_at: "2026-03-15" },
  { id: "7", status: "date_agreed", type: "measurement", client_name: "Егорова Т.Л.", created_at: "2026-03-14" },
  { id: "8", status: "date_agreed", type: "installation", client_name: "Михайлова Е.В.", created_at: "2026-03-14" },
  { id: "9", status: "measurement_done", type: "measurement", client_name: "Новиков А.А.", created_at: "2026-03-13" },
  { id: "10", status: "closed", type: "measurement", client_name: "Соколова Н.Р.", created_at: "2026-03-12" },
  { id: "11", status: "closed", type: "installation", client_name: "Кузнецов П.П.", created_at: "2026-03-11" },
  { id: "12", status: "closed", type: "reclamation", client_name: "Морозов А.И.", created_at: "2026-03-10" },
];

const demoChartData = [
  { name: "Пн", заявки: 8, выполнено: 5 },
  { name: "Вт", заявки: 12, выполнено: 9 },
  { name: "Ср", заявки: 6, выполнено: 7 },
  { name: "Чт", заявки: 15, выполнено: 11 },
  { name: "Пт", заявки: 10, выполнено: 8 },
  { name: "Сб", заявки: 4, выполнено: 6 },
  { name: "Вс", заявки: 2, выполнено: 3 },
];

const IN_PROGRESS = ["pending", "measurer_assigned", "date_agreed", "measurement_done", "installation_rescheduled"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const isDemo = user?.id?.startsWith("demo");

  const stats = useMemo(() => {
    const total = demoRequests.length;
    const newCount = demoRequests.filter(r => r.status === "new").length;
    const inProgress = demoRequests.filter(r => IN_PROGRESS.includes(r.status)).length;
    const closed = demoRequests.filter(r => r.status === "closed").length;
    return { total, newCount, inProgress, closed };
  }, []);

  const recentRequests = demoRequests.slice(0, 5);

  const funnelData = useMemo(() => {
    const stages: { status: RequestStatus; fill: string }[] = [
      { status: "new", fill: "#3b82f6" },
      { status: "pending", fill: "#eab308" },
      { status: "measurer_assigned", fill: "#f59e0b" },
      { status: "date_agreed", fill: "#06b6d4" },
      { status: "measurement_done", fill: "#8b5cf6" },
      { status: "closed", fill: "#22c55e" },
    ];
    return stages.map(s => ({
      name: statusLabels[s.status],
      value: demoRequests.filter(r => r.status === s.status).length,
      fill: s.fill,
    }));
  }, []);

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Дашборд</h1>
          {isDemo && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Демо-режим
            </span>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего заявок</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Новые</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.newCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">В работе</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Закрыты</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.closed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly chart */}
          <Card className="bg-white border-slate-200 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Заявки за неделю
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="заявки" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="выполнено" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent requests */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-900">Последние заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{req.client_name}</p>
                    <p className="text-xs text-slate-400">{req.created_at}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status as RequestStatus]}`}>
                    {statusLabels[req.status as RequestStatus]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Funnel */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">Воронка заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {funnelData.map((stage, i) => {
                const maxVal = Math.max(...funnelData.map(s => s.value), 1);
                const height = (stage.value / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-slate-700">{stage.value}</span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{ height: `${height}%`, backgroundColor: stage.fill, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-slate-400 text-center leading-tight mt-1">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
