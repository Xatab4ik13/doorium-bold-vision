import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import type { RequestStatus, RequestType } from "@/data/mockDashboard";

export interface FilterState {
  search: string;
  status: string;
  type: string;
  city: string;
  measurerId: string;
  installerId: string;
  partnerId: string;
  dateFrom: string;
  dateTo: string;
  dateField: string;
}

export const defaultFilters: FilterState = {
  search: "",
  status: "all",
  type: "all",
  city: "all",
  measurerId: "all",
  installerId: "all",
  partnerId: "all",
  dateFrom: "",
  dateTo: "",
  dateField: "created_at",
};

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  users?: { id: string; name: string; role: string }[];
}

const RequestFilters = ({ filters, onChange, users = [] }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const measurers = users.filter(u => u.role === "measurer");
  const installers = users.filter(u => u.role === "installer");
  const partners = users.filter(u => u.role === "partner");

  const hasActiveFilters = filters.status !== "all" || filters.type !== "all" || filters.measurerId !== "all" || filters.installerId !== "all" || filters.partnerId !== "all" || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени, номеру или адресу..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            hasActiveFilters ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Фильтры
          {hasActiveFilters && (
            <X className="w-3 h-3 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); onChange(defaultFilters); }} />
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-lg border border-slate-200">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Статус</label>
            <select value={filters.status} onChange={(e) => update("status", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="pending">В ожидании</option>
              <option value="measurer_assigned">Замерщик назначен</option>
              <option value="date_agreed">Дата согласована</option>
              <option value="measurement_done">Замер выполнен</option>
              <option value="closed">Закрыта</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Тип</label>
            <select value={filters.type} onChange={(e) => update("type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
              <option value="all">Все</option>
              <option value="measurement">Замер</option>
              <option value="installation">Монтаж</option>
              <option value="reclamation">Рекламация</option>
            </select>
          </div>
          {measurers.length > 0 && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Замерщик</label>
              <select value={filters.measurerId} onChange={(e) => update("measurerId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="all">Все</option>
                {measurers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          {installers.length > 0 && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Монтажник</label>
              <select value={filters.installerId} onChange={(e) => update("installerId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="all">Все</option>
                {installers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Дата от</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => update("dateFrom", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Дата до</label>
            <input type="date" value={filters.dateTo} onChange={(e) => update("dateTo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;
