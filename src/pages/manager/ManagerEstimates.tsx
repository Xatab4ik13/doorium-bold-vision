import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const ManagerEstimates = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="manager" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Сметы</h1>
        <EstimateCalculator />
      </div>
    </DashboardLayout>
  );
};
export default ManagerEstimates;
