import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { demoRequests } from "@/data/demoData";
import { statusColors, type RequestStatus } from "@/data/mockDashboard";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  role: "measurer" | "installer";
}

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const PersonalCalendar = ({ role }: Props) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const monthName = currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const myRequests = useMemo(() => {
    return demoRequests.filter(r => {
      if (role === "measurer") return r.measurer_id;
      return r.installer_id;
    }).filter(r => r.agreed_date);
  }, [role]);

  const requestsByDate = useMemo(() => {
    const map: Record<string, typeof demoRequests> = {};
    myRequests.forEach(r => {
      const d = r.agreed_date!.split("T")[0];
      if (!map[d]) map[d] = [];
      map[d].push(r);
    });
    return map;
  }, [myRequests]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role={role} userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-semibold text-slate-900 capitalize">{monthName}</h1>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
          ))}
          {Array.from({ length: startOffset }, (_, i) => <div key={`e-${i}`} className="h-20" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const reqs = requestsByDate[dateStr] || [];
            const isToday = dateStr === today;
            return (
              <div key={day} className={`h-20 rounded-lg border p-1.5 text-xs ${isToday ? "border-blue-300 bg-blue-50/50" : "border-slate-100 bg-white"}`}>
                <div className={`font-medium mb-1 ${isToday ? "text-blue-600" : "text-slate-700"}`}>{day}</div>
                {reqs.slice(0, 2).map(r => (
                  <div key={r.id} className={`truncate px-1 py-0.5 rounded text-[10px] mb-0.5 ${statusColors[r.status as RequestStatus]}`}>
                    {r.client_name.split(" ")[0]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonalCalendar;
