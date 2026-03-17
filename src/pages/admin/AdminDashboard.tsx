import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Дашборд</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего заявок</p>
                  <p className="text-3xl font-bold text-slate-900">—</p>
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
                  <p className="text-3xl font-bold text-slate-900">—</p>
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
                  <p className="text-3xl font-bold text-slate-900">—</p>
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
                  <p className="text-3xl font-bold text-slate-900">—</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Подключите бэкенд</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Для отображения данных необходимо настроить API-сервер на VPS и указать URL в переменной окружения <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">VITE_API_URL</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
