import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import api from "@/lib/api";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { toast } from "sonner";

type Role = "admin" | "manager";
type AbsenceKind = "dayoff" | "vacation" | "sick";

interface DayRequest {
  id: string;
  number: string;
  type: string;
  status: string;
  client_name: string;
  client_address: string;
  city?: string;
}

interface AvailabilityUser {
  id: string;
  name: string;
  role: "installer" | "measurer";
}

interface AvailabilityResponse {
  users: AvailabilityUser[];
  requestsByUserDay: Record<string, Record<string, DayRequest[]>>;
  absences: Record<string, Record<string, AbsenceKind>>;
}

const WEEKDAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
const dayKey = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const fmtDDMMYYYY = (y: number, m: number, d: number) => `${pad2(d)}.${pad2(m + 1)}.${y}`;

const KIND_LABEL: Record<AbsenceKind, string> = {
  dayoff: "Выходной",
  vacation: "Отпуск",
  sick: "Больничный",
};

const ROLE_LABEL: Record<"installer" | "measurer", string> = {
  installer: "Монтажники",
  measurer: "Замерщики",
};

interface Props {
  role: Role;
}

const AvailabilityPage = ({ role }: Props) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [city, setCity] = useState<CityFilter>("Москва");
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const [popup, setPopup] = useState<{ userId: string; day: string } | null>(null);
  const [openRequest, setOpenRequest] = useState<ApiRequest | null>(null);

  const { updateRequest, deleteRequest, requests: allRequests, fetchRequests } = useRequests();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api<AvailabilityResponse>(
        `/api/availability?month=${monthKey(cursor)}&city=${encodeURIComponent(city)}`,
        { auth: true },
      );
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки занятости");
    } finally {
      setLoading(false);
    }
  }, [cursor, city]);

  useEffect(() => {
    load();
  }, [load]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  );
  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    let list = data.users;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q));
    }
    if (selectedUserIds.length > 0) {
      list = list.filter((u) => selectedUserIds.includes(u.id));
    }
    return list;
  }, [data, search, selectedUserIds]);

  const grouped = useMemo(() => {
    const installers = filteredUsers.filter((u) => u.role === "installer");
    const measurers = filteredUsers.filter((u) => u.role === "measurer");
    return { installer: installers, measurer: measurers };
  }, [filteredUsers]);

  const cellInfo = (userId: string, day: number) => {
    const dk = dayKey(year, month, day);
    const reqs = data?.requestsByUserDay[userId]?.[dk] || [];
    const absence = data?.absences[userId]?.[dk];
    let cls = "bg-muted/40 text-muted-foreground";
    if (absence === "dayoff") cls = "bg-sky-500/80 text-white";
    else if (absence === "vacation") cls = "bg-violet-500/80 text-white";
    else if (absence === "sick") cls = "bg-rose-500/80 text-white";
    else if (reqs.length >= 2) cls = "bg-orange-500/85 text-white";
    else if (reqs.length === 1) cls = "bg-emerald-500/80 text-white";
    return { reqs, absence, cls, dk };
  };

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const openFilter = () => {
    setDraftSelection(selectedUserIds);
    setFilterModalOpen(true);
  };

  const toggleAbsence = async (userId: string, dk: string, kind: AbsenceKind | null) => {
    try {
      await api("/api/availability/absence", {
        method: "POST",
        body: { user_id: userId, date: dk, kind },
        auth: true,
      });
      setData((prev) => {
        if (!prev) return prev;
        const nextAbs = { ...prev.absences, [userId]: { ...(prev.absences[userId] || {}) } };
        if (kind === null) delete nextAbs[userId][dk];
        else nextAbs[userId][dk] = kind;
        return { ...prev, absences: nextAbs };
      });
      toast.success(kind ? `Отметка: ${KIND_LABEL[kind]}` : "Отметка снята");
    } catch (err: any) {
      toast.error(err.message || "Ошибка сохранения");
    }
  };

  const popupData = useMemo(() => {
    if (!popup || !data) return null;
    const user = data.users.find((u) => u.id === popup.userId);
    if (!user) return null;
    const reqs = data.requestsByUserDay[popup.userId]?.[popup.day] || [];
    const absence = data.absences[popup.userId]?.[popup.day] || null;
    const [yy, mm, dd] = popup.day.split("-").map(Number);
    const wDay = WEEKDAYS_SHORT[new Date(yy, mm - 1, dd).getDay()];
    return {
      user, reqs, absence,
      dateLabel: `${fmtDDMMYYYY(yy, mm - 1, dd)}, ${wDay}`,
    };
  }, [popup, data]);

  const openRequestFromList = (id: string) => {
    const full = allRequests.find((r) => r.id === id);
    if (full) {
      setOpenRequest(full);
      setPopup(null);
    } else {
      toast.error("Заявка не найдена в текущей выгрузке");
    }
  };

  const renderRow = (u: AvailabilityUser) => (
    <tr key={u.id} className="border-b border-border/40 hover:bg-accent/20">
      <td className="sticky left-0 z-10 bg-card px-3 py-1.5 min-w-[200px] border-r border-border/50">
        <div className="text-sm truncate">{u.name}</div>
      </td>
      {days.map((d) => {
        const { reqs, cls, dk } = cellInfo(u.id, d);
        return (
          <td key={d} className="p-0.5 align-middle text-center">
            <button
              onClick={() => setPopup({ userId: u.id, day: dk })}
              className={`w-8 h-8 rounded text-xs font-semibold transition-all hover:opacity-80 ${cls}`}
            >
              {reqs.length > 0 ? reqs.length : ""}
            </button>
          </td>
        );
      })}
    </tr>
  );

  return (
    <DashboardLayout role={role} onRefresh={load}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Занятость</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Календарь занятости монтажников и замерщиков
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card rounded-xl border border-border/50 p-1">
              <button
                onClick={goPrev}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-lg min-w-[180px] text-center"
              >
                {MONTH_NAMES[month]} {year}
              </button>
              <button
                onClick={goNext}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Следующий месяц"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <CityToggle value={city} onChange={setCity} />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { cls: "bg-muted/40 border border-border", label: "Свободно" },
            { cls: "bg-emerald-500/80", label: "1 заявка" },
            { cls: "bg-orange-500/85", label: "2+ заявок" },
            { cls: "bg-sky-500/80", label: "Выходной" },
            { cls: "bg-violet-500/80", label: "Отпуск" },
            { cls: "bg-rose-500/80", label: "Больничный" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-sm ${l.cls}`} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск сотрудника…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={openFilter}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/50 text-sm font-medium hover:bg-accent"
          >
            <Users size={16} />
            Показать только…
          </button>
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Выбрано: {selectedUserIds.length}</span>
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-primary hover:underline"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-260px)]">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Загрузка…</div>
            ) : !data || filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">Нет сотрудников</div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-card">
                  <tr className="border-b border-border/50">
                    <th className="sticky left-0 z-30 bg-card px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px] border-r border-border/50">
                      Сотрудник
                    </th>
                    {days.map((d) => {
                      const wd = new Date(year, month, d).getDay();
                      const isWeekend = wd === 0 || wd === 6;
                      return (
                        <th
                          key={d}
                          className={`px-0.5 py-2 text-center text-[10px] font-medium uppercase min-w-[36px] ${
                            isWeekend ? "text-rose-500" : "text-muted-foreground"
                          }`}
                        >
                          <div className="text-sm font-semibold">{d}</div>
                          <div className="text-[9px]">{WEEKDAYS_SHORT[wd]}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(["installer", "measurer"] as const).map((r) => {
                    const list = grouped[r];
                    if (list.length === 0) return null;
                    return (
                      <>
                        <tr key={`group-${r}`} className="bg-muted/30">
                          <td
                            colSpan={days.length + 1}
                            className="sticky left-0 px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          >
                            {ROLE_LABEL[r]} ({list.length})
                          </td>
                        </tr>
                        {list.map(renderRow)}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Filter modal */}
      {filterModalOpen && data && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFilterModalOpen(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border/50 max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold">Показать только…</h3>
              <button onClick={() => setFilterModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
              <button
                onClick={() => setDraftSelection(data.users.map((u) => u.id))}
                className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/70"
              >
                Все
              </button>
              <button
                onClick={() => setDraftSelection([])}
                className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/70"
              >
                Сбросить
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {(["installer", "measurer"] as const).map((r) => {
                const list = data.users.filter((u) => u.role === r);
                if (!list.length) return null;
                return (
                  <div key={r}>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
                      {ROLE_LABEL[r]}
                    </div>
                    <div className="space-y-1">
                      {list.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftSelection.includes(u.id)}
                            onChange={(e) => {
                              setDraftSelection((prev) =>
                                e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id),
                              );
                            }}
                          />
                          <span className="text-sm">{u.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-border/50 flex justify-end gap-2">
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm hover:bg-accent"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setSelectedUserIds(draftSelection);
                  setFilterModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cell popup */}
      {popupData && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border/50 max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div>
                <div className="font-semibold">{popupData.user.name}</div>
                <div className="text-xs text-muted-foreground">{popupData.dateLabel}</div>
              </div>
              <button onClick={() => setPopup(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {popupData.reqs.length > 0 ? (
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    Заявки ({popupData.reqs.length})
                  </div>
                  <div className="space-y-2">
                    {popupData.reqs.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => openRequestFromList(r.id)}
                        className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{r.number}</span>
                          <span className="text-xs text-muted-foreground">{r.type}</span>
                        </div>
                        <div className="text-sm mt-1">{r.client_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.client_address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-2">Заявок нет</div>
              )}

              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Отметка</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["dayoff", "vacation", "sick"] as const).map((k) => {
                    const active = popupData.absence === k;
                    const colorMap: Record<AbsenceKind, string> = {
                      dayoff: "bg-sky-500/80 text-white",
                      vacation: "bg-violet-500/80 text-white",
                      sick: "bg-rose-500/80 text-white",
                    };
                    return (
                      <button
                        key={k}
                        onClick={() => toggleAbsence(popupData.user.id, popup!.day, active ? null : k)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          active ? `${colorMap[k]} ring-2 ring-primary` : "bg-accent hover:bg-accent/70"
                        }`}
                      >
                        {KIND_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
                {popupData.absence && (
                  <button
                    onClick={() => toggleAbsence(popupData.user.id, popup!.day, null)}
                    className="mt-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent"
                  >
                    Снять отметку
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {openRequest && (
        <RequestDetailModal
          request={openRequest}
          onClose={() => setOpenRequest(null)}
          onSave={async (id, updates) => {
            await updateRequest(id, updates);
            await fetchRequests(true);
            await load();
          }}
          onDelete={async (id) => {
            await deleteRequest(id);
            setOpenRequest(null);
            await load();
          }}
          viewerRole={role}
        />
      )}
    </DashboardLayout>
  );
};

export default AvailabilityPage;
