import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { UserCheck, ArrowRight } from "lucide-react";

const unassigned = [
  { id: "1", number: "REQ-001", client_name: "Иванов И.И.", type: "Замер", address: "ул. Ленина, 15" },
  { id: "2", number: "REQ-004", client_name: "Егорова Т.Л.", type: "Монтаж", address: "ул. Центральная, 1" },
  { id: "3", number: "REQ-006", client_name: "Волкова М.И.", type: "Рекламация", address: "ул. Советская, 44" },
];

const executors = [
  { id: "m1", name: "Сидоров К.В.", role: "Замерщик" },
  { id: "m2", name: "Морозов А.И.", role: "Замерщик" },
  { id: "i1", name: "Бригада №1", role: "Монтажник" },
  { id: "i2", name: "Бригада №2", role: "Монтажник" },
];

const ManagerAssign = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6" /> Распределение
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base text-slate-900">Нераспределённые заявки ({unassigned.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {unassigned.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-slate-400">{r.number}</span>
                      <span className="ml-2 text-xs font-medium text-slate-600">{r.type}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="text-sm font-medium text-slate-800 mt-1">{r.client_name}</div>
                  <div className="text-xs text-slate-400">{r.address}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader><CardTitle className="text-base text-slate-900">Исполнители</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {executors.map((e) => (
                <div key={e.id} className="p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{e.name}</div>
                    <div className="text-xs text-slate-400">{e.role}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
                    {e.name.charAt(0)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerAssign;
