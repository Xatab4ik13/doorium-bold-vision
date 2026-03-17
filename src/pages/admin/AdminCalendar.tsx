import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InstallationCalendar from "@/components/dashboard/InstallationCalendar";
import { useAuth } from "@/contexts/AuthContext";

const AdminCalendar = () => {
  const { user } = useAuth();
  const [city, setCity] = useState("Москва");
  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Календарь</h1>
        <InstallationCalendar cityFilter={city} />
      </div>
    </DashboardLayout>
  );
};
export default AdminCalendar;
