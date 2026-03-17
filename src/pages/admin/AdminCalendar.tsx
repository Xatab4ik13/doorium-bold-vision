import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const demoEvents: Record<string, { title: string; type: string; color: string }[]> = {
  "2026-03-17": [{ title: "Замер — Иванов И.И.", type: "measurement", color: "bg-blue-500" }],
  "2026-03-18": [
    { title: "Монтаж — Егорова Т.Л.", type: "installation", color: "bg-emerald-500" },
    { title: "Замер — Петрова А.С.", type: "measurement", color: "bg-blue-500" },
  ],
  "2026-03-20": [{ title: "Замер — Лебедев В.Г.", type: "measurement", color: "bg-blue-500" }],
  "2026-03-21": [{ title: "Монтаж — Михайлова Е.В.", type: "installation", color: "bg-emerald-500" }],
  "2026-03-24": [{ title: "Рекламация — Волкова М.И.", type: "reclamation", color: "bg-rose-500" }],
};

const AdminCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Календарь</h1>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <CardTitle className="text-lg text-slate-900">
                {monthNames[month]} {year}
              </CardTitle>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
              {DAYS.map((d) => (
                <div key={d} className="bg-slate-50 text-center py-2 text-xs font-medium text-slate-500">
                  {d}
                </div>
              ))}
              {days.map((day, i) => {
                const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                const events = day ? demoEvents[dateStr] || [] : [];
                const isToday = dateStr === "2026-03-17";

                return (
                  <div
                    key={i}
                    className={`bg-white min-h-[80px] p-1.5 ${!day ? "bg-slate-50" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${isToday ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-slate-600"}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {events.map((ev, j) => (
                            <div key={j} className={`${ev.color} text-white text-[10px] px-1.5 py-0.5 rounded truncate`}>
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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

export default AdminCalendar;
