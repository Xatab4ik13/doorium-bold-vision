import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calculator } from "lucide-react";

const ManagerEstimates = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Сметы</h1>
        <Card className="bg-white border-slate-200">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Calculator className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">Калькулятор смет будет доступен после подключения бэкенда</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
export default ManagerEstimates;
