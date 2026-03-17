import { useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Pause, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useRequests, useUsers } from "@/hooks/useRequests";

const FUNNEL_STAGES: { status: RequestStatus; fill: string }[] = [
  { status: "new", fill: "hsl(217, 91%, 50%)" },
  { status: "pending", fill: "hsl(45, 93%, 47%)" },
  { status: "measurer_assigned", fill: "hsl(38, 92%, 50%)" },
  { status: "date_agreed", fill: "hsl(190, 80%, 45%)" },
  { status: "measurement_done", fill: "hsl(280, 65%, 50%)" },
  { status: "closed", fill: "hsl(142, 71%, 45%)" },
];
const IN_PROGRESS: RequestStatus[] = ["pending", "measurer_assigned", "date_agreed", "measurement_done"];
const DONE: RequestStatus[] = ["closed"];
const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requests, loading } = useRequests();
  const { getUserName } = useUsers();
  useEffect(() => { document.title = "Админ-панель — Doorium Service"; }, []);

  const stats = useMemo(() => {
    const r = requests;
    return { total: r.length, newCount: r.filter(x => x.status === "new").length, pendingCount: r.filter(x => x.status === "pending").length, inProgress: r.filter(x => IN_PROGRESS.includes(x.status as RequestStatus)).length, completed: r.filter(x => DONE.includes(x.status as RequestStatus)).length, reclamations: r.filter(x => x.type === "reclamation").length };
  }, [requests]);

  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayRequests = requests.filter(r => r.created_at?.split("T")[0] === dateStr);
      const dayCompleted = requests.filter(r => r.closed_at?.split("T")[0] === dateStr);
      return { name: DAY_NAMES[d.getDay()], заявки: dayRequests.length, выполнено: dayCompleted.length };
    });
  }, [requests]);

  const funnelData = useMemo(() => {
    const order = FUNNEL_STAGES.map(s => s.status);
    return FUNNEL_STAGES.map((stage, idx) => ({
      stage: statusLabels[stage.status],
      value: idx === 0 ? requests.length : requests.filter(r => order.indexOf(r.status as RequestStatus) >= idx).length,
      fill: stage.fill,
    }));
  }, [requests]);

  const topEmployees = useMemo(() => {
    const c: Record<string, { name: string; role: string; n: number }> = {};
    requests.filter(r => DONE.includes(r.status as RequestStatus)).forEach(r => {
      [{ id: r.measurer_id, role: "Замерщик" }, { id: r.installer_id, role: "Монтажник" }].forEach(({ id, role }) => {
        if (!id) return;
        if (!c[id]) c[id] = { name: getUserName(id) || id, role, n: 0 };
        c[id].n++;
      });
    });
    return Object.values(c).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [requests, getUserName]);

  const statCards = [
    { label: "Всего заявок", value: stats.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-blue-600 bg-blue-50", href: "/admin/requests" },
    { label: "Новые", value: stats.newCount, icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-600 bg-amber-50", href: "/admin/requests?quick=new" },
    { label: "В ожидании", value: stats.pendingCount, icon: <Pause className="w-5 h-5" />, color: "text-yellow-600 bg-yellow-50", href: "/admin/requests?quick=pending" },
    { label: "В работе", value: stats.inProgress, icon: <Clock className="w-5 h-5" />, color: "text-purple-600 bg-purple-50", href: "/admin/requests?quick=in_progress" },
    { label: "Выполнено", value: stats.completed, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-600 bg-green-50", href: "/admin/requests?quick=closed" },
    { label: "Рекламации", value: stats.reclamations, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600 bg-red-50", href: "/admin/requests?quick=reclamation" },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.name}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Дашборд</h1>
        <div className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-6"}`}>
          {statCards.map(s => (
            <Card key={s.label} onClick={() => navigate(s.href)} className="bg-white border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 px-4">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base">Динамика за неделю</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="заявки" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="выполнено" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base">Воронка конверсии</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {funnelData.map(item => (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-600">{item.stage}</span><span className="font-medium text-slate-800">{item.value}</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0}%`, backgroundColor: item.fill }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base">Топ сотрудников</CardTitle></CardHeader>
            <CardContent>
              {topEmployees.length === 0 ? <div className="text-sm text-slate-400 text-center py-6">Нет данных</div> : (
                <div className="space-y-2">{topEmployees.map((emp, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <div className="flex-1"><div className="text-sm font-medium text-slate-800">{emp.name}</div><div className="text-xs text-slate-400">{emp.role}</div></div>
                    <div className="text-sm font-bold text-slate-700">{emp.n}</div>
                  </div>
                ))}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base">Последние заявки</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">{requests.slice(0, 6).map(r => (
                <div key={r.id} onClick={() => navigate("/admin/requests")} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5"><span className="text-xs font-mono text-slate-400">{r.number}</span><span className="text-xs text-slate-500">{requestTypeLabels[r.type]}</span></div>
                    <div className="text-sm font-medium text-slate-800">{r.client_name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus]}`}>{getStatusLabel(r.status as RequestStatus, r.type as RequestType)}</span>
                </div>
              ))}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminDashboard;
