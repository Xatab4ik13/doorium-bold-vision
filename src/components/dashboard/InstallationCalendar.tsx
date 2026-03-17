import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";
import { demoRequests, getDemoUserName } from "@/data/demoData";
import { statusColors, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import CityToggle from "@/components/dashboard/CityToggle";

interface Props {
  city: string;
  onCityChange: (c: string) => void;
}

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const InstallationCalendar = ({ city, onCityChange }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based

  const daysInMonth = lastDay.getDate();
  const monthName = currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  // Map requests to dates
  const requestsByDate = useMemo(() => {
    const map: Record<string, typeof demoRequests> = {};
    demoRequests
      .filter(r => !city || r.city === city)
      .filter(r => r.agreed_date)
      .forEach(r => {
        const d = r.agreed_date!.split("T")[0];
        if (!map[d]) map[d] = [];
        map[d].push(r);
      });
    return map;
  }, [city]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthName}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <CityToggle value={city} onChange={onCityChange} />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
        ))}
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`empty-${i}`} className="h-24" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const reqs = requestsByDate[dateStr] || [];
          const isToday = dateStr === today;

          return (
            <div
              key={day}
              className={`h-24 rounded-lg border p-1.5 text-xs ${
                isToday ? "border-blue-300 bg-blue-50/50" : "border-slate-100 bg-white"
              }`}
            >
              <div className={`font-medium mb-1 ${isToday ? "text-blue-600" : "text-slate-700"}`}>{day}</div>
              {reqs.slice(0, 2).map(r => (
                <div key={r.id} className={`truncate px-1 py-0.5 rounded text-[10px] mb-0.5 ${statusColors[r.status as RequestStatus]}`}>
                  {r.client_name.split(" ")[0]}
                </div>
              ))}
              {reqs.length > 2 && <div className="text-[10px] text-slate-400">+{reqs.length - 2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstallationCalendar;
