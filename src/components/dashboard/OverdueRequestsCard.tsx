import { useMemo, useState } from "react";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { type ApiRequest } from "@/hooks/useRequests";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

const OVERDUE_DAYS = 5;
// Закрытые, отменённые и заявки «В ожидании» не считаются просроченными
const EXCLUDED_STATUSES = ["closed", "cancelled", "client_refused", "pending"];

/** Монтажи и рекламации, не закрытые более OVERDUE_DAYS дней */
export function getOverdueRequests(requests: ApiRequest[]) {
  const now = new Date();
  return requests
    .filter((r) => {
      if (r.type !== "installation" && r.type !== "reclamation") return false;
      if (EXCLUDED_STATUSES.includes(r.status)) return false;
      if (!r.created_at) return false;
      return differenceInCalendarDays(now, parseISO(r.created_at)) > OVERDUE_DAYS;
    })
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}

interface OverdueRequestsCardProps {
  requests: ApiRequest[];
  onOpenRequest?: (r: ApiRequest) => void;
}

const OverdueRequestsCard = ({ requests, onOpenRequest }: OverdueRequestsCardProps) => {
  const [open, setOpen] = useState(false);
  const overdue = useMemo(() => getOverdueRequests(requests), [requests]);

  if (overdue.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-xl border border-destructive/40 bg-destructive/10 shadow-md p-4 flex items-center gap-3 animate-pulse hover:bg-destructive/15 transition-colors"
      >
        <div className="p-2 rounded-lg bg-destructive/20 text-destructive shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Незакрытые заказы</p>
          <p className="text-xs text-destructive/80">Монтажи и рекламации без закрытия более {OVERDUE_DAYS} дней</p>
        </div>
        <span className="text-2xl font-bold font-heading text-destructive">{overdue.length}</span>
        <ChevronRight size={18} className="text-destructive shrink-0" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-destructive" />
                <h2 className="text-lg font-heading font-bold">Незакрытые заказы ({overdue.length})</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1">
              {overdue.map((r) => {
                const days = r.created_at ? differenceInCalendarDays(new Date(), parseISO(r.created_at)) : 0;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setOpen(false); onOpenRequest?.(r); }}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-xs text-primary">{r.number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                          {requestTypeLabels[r.type] || r.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"}`}>
                          {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{r.client_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-destructive">{days} дн.</p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.created_at ? format(parseISO(r.created_at), "dd.MM.yyyy") : "—"}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverdueRequestsCard;
