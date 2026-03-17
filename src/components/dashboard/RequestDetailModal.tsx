import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, getNextStatuses, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, FileText, User, Briefcase, ChevronRight } from "lucide-react";
import type { ApiRequest } from "@/hooks/useRequests";
import { getDemoUserName } from "@/data/demoData";

interface Props {
  request: ApiRequest;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<ApiRequest>) => Promise<any>;
  onDelete?: (id: string) => Promise<void>;
  onSendToInstallation?: (req: ApiRequest) => Promise<void>;
  viewerRole?: string;
}

const RequestDetailModal = ({ request, onClose, onSave, onDelete, onSendToInstallation, viewerRole = "admin" }: Props) => {
  const r = request;
  const nextStatuses = getNextStatuses(r.status as RequestStatus, r.type as RequestType);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (onSave) await onSave(r.id, { status: newStatus } as Partial<ApiRequest>);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm text-slate-500">{r.number}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus]}`}>
              {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Client info */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Клиент</div>
                <div className="font-medium text-slate-800">{r.client_name}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Телефон</div>
                <a href={`tel:${r.client_phone}`} className="font-medium text-blue-600 hover:underline">{r.client_phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Адрес</div>
                <div className="font-medium text-slate-800">{r.client_address}</div>
                {r.city && <div className="text-xs text-slate-400">{r.city}</div>}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Тип</div>
                <div className="font-medium text-slate-800">{requestTypeLabels[r.type]}</div>
              </div>
            </div>
            {r.agreed_date && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">Согласованная дата</div>
                  <div className="font-medium text-slate-800">{r.agreed_date.split("T")[0]}</div>
                </div>
              </div>
            )}
          </div>

          {/* Door counts */}
          {(r.interior_doors || r.entrance_doors || r.partitions) && (
            <div className="grid grid-cols-3 gap-2">
              {r.interior_doors != null && (
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-slate-800">{r.interior_doors}</div>
                  <div className="text-xs text-slate-500">Межком.</div>
                </div>
              )}
              {r.entrance_doors != null && (
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-slate-800">{r.entrance_doors}</div>
                  <div className="text-xs text-slate-500">Входные</div>
                </div>
              )}
              {r.partitions != null && (
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-slate-800">{r.partitions}</div>
                  <div className="text-xs text-slate-500">Перег.</div>
                </div>
              )}
            </div>
          )}

          {/* Assigned employees */}
          <div className="space-y-1">
            {r.measurer_id && (
              <div className="text-sm"><span className="text-slate-500">Замерщик:</span> <span className="font-medium">{getDemoUserName(r.measurer_id) || "—"}</span></div>
            )}
            {r.installer_id && (
              <div className="text-sm"><span className="text-slate-500">Монтажник:</span> <span className="font-medium">{getDemoUserName(r.installer_id) || "—"}</span></div>
            )}
            {r.partner_id && (
              <div className="text-sm"><span className="text-slate-500">Партнёр:</span> <span className="font-medium">{getDemoUserName(r.partner_id) || "—"}</span></div>
            )}
            {r.amount != null && (
              <div className="text-sm"><span className="text-slate-500">Сумма:</span> <span className="font-bold text-green-600">{r.amount.toLocaleString("ru-RU")} ₽</span></div>
            )}
          </div>

          {/* Work description / notes */}
          {r.work_description && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Описание работ</div>
              <div className="text-sm bg-slate-50 p-3 rounded-lg">{r.work_description}</div>
            </div>
          )}
          {r.notes && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Заметки</div>
              <div className="text-sm bg-slate-50 p-3 rounded-lg">{r.notes}</div>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-4 text-xs text-slate-400 border-t pt-3">
            <div>Создана: {r.created_at?.split("T")[0]}</div>
            {r.updated_at && <div>Обновлена: {r.updated_at.split("T")[0]}</div>}
            {r.closed_at && <div>Закрыта: {r.closed_at.split("T")[0]}</div>}
          </div>

          {/* Actions */}
          {viewerRole === "admin" && onSave && nextStatuses.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <div className="text-xs text-slate-500 mb-2">Сменить статус:</div>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {statusLabels[st]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewerRole === "admin" && onSendToInstallation && r.type === "measurement" && r.status === "measurement_done" && (
            <button
              onClick={() => onSendToInstallation(r)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Создать заявку на монтаж <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {viewerRole === "admin" && onDelete && (
            <button
              onClick={() => { onDelete(r.id); onClose(); }}
              className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Удалить заявку
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailModal;
