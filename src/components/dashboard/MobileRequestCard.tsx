import { statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Phone, MapPin, ChevronRight } from "lucide-react";
import type { ApiRequest } from "@/hooks/useRequests";

interface Props {
  request: ApiRequest;
  index: number;
  onClick: () => void;
  getUserName?: (id?: string) => string | undefined;
}

const MobileRequestCard = ({ request: r, index, onClick, getUserName }: Props) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200/50 p-3.5 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{r.number}</span>
          <span className="text-xs font-medium text-slate-600">{requestTypeLabels[r.type] || r.type}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus]}`}>
          {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
        </span>
      </div>
      <div className="text-sm font-medium text-slate-800 mb-1">{r.client_name}</div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {r.client_phone}
        </span>
        {r.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {r.city}
          </span>
        )}
      </div>
      {r.client_address && (
        <div className="text-xs text-slate-400 mt-1 truncate">{r.client_address}</div>
      )}
    </div>
  );
};

export default MobileRequestCard;
