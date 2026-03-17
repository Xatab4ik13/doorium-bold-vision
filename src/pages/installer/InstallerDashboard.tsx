import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, Camera, X, ChevronRight, AlertCircle, ClipboardCheck, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const InstallerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ApiRequest | null>(null);

  const [doorsInstalled, setDoorsInstalled] = useState("");
  const [hardwareInstalled, setHardwareInstalled] = useState("");
  const [clientAccepted, setClientAccepted] = useState(false);
  const [defects, setDefects] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [validationShown, setValidationShown] = useState(false);
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleComment, setRescheduleComment] = useState("");

  useEffect(() => { document.title = "Мои заявки — Монтажник"; }, []);

  const handleSelectRequest = (r: ApiRequest) => {
    setSelected(r);
    setDoorsInstalled("");
    setHardwareInstalled("");
    setClientAccepted(false);
    setDefects("");
    setUploadedFiles([]);
    setValidationShown(false);
    setAgreedDate(r.agreed_date?.split("T")[0] || "");
    setDateConfirmed(!!r.agreed_date);
    setRescheduleOpen(false);
    setRescheduleComment("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setTimeout(() => {
      const newUrls = files.map((f, i) => `demo://uploads/${Date.now()}_${i}_${f.name}`);
      setUploadedFiles(prev => [...prev, ...newUrls]);
      toast.success(`Загружено: ${files.length}`);
      setUploading(false);
    }, 800);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = async () => {
    if (!agreedDate || !selected) return;
    if (!selected.agreed_date) {
      toast.error(selected.type === "reclamation" ? "Дата визита назначается менеджером" : "Дата монтажа назначается менеджером");
      return;
    }
    if (!rescheduleComment.trim()) {
      toast.error("Укажите причину переноса");
      return;
    }
    try {
      const updated = await updateRequest(selected.id, {
        agreed_date: agreedDate,
        status_comment: rescheduleComment.trim(),
        status: (selected.type === "reclamation" ? "date_agreed" : "installation_rescheduled") as any,
      });
      setDateConfirmed(true);
      setRescheduleOpen(false);
      setSelected(updated as ApiRequest);
      toast.success("Дата перенесена");
    } catch {}
  };

  const isReclamation = selected?.type === "reclamation";
  const isComplete = dateConfirmed && doorsInstalled.trim() && (isReclamation || hardwareInstalled.trim()) && clientAccepted && uploadedFiles.length > 0;

  const handleComplete = async () => {
    if (!isComplete) { setValidationShown(true); return; }
    if (!selected) return;
    try {
      const allPhotos = uploadedFiles.map(url => ({ url, type: "image", stage: "general", uploaded_at: new Date().toISOString() }));
      const existingPhotos = selected.photos || [];
      await updateRequest(selected.id, {
        status: "closed" as any,
        notes: selected.type === "reclamation"
          ? `Результат: ${doorsInstalled}. ${defects ? `Замечания: ${defects}` : ""}`
          : `Двери: ${doorsInstalled}, Фурнитура: ${hardwareInstalled}. ${defects ? `Дефекты: ${defects}` : ""}`,
        photos: [...existingPhotos, ...allPhotos] as any,
      });
      setSelected(null);
      toast.success(selected.type === "reclamation" ? "Рекламация закрыта" : "Монтаж завершён");
    } catch {}
  };

  const activeRequests = requests.filter((r) => !["closed", "cancelled"].includes(r.status));
  const doneRequests = requests.filter((r) => r.status === "closed");

  const missingFields: string[] = [];
  if (validationShown && !isComplete) {
    if (!dateConfirmed) missingFields.push("Согласованная дата");
    if (!doorsInstalled.trim()) missingFields.push(isReclamation ? "Описание работ" : "Установленные двери");
    if (!isReclamation && !hardwareInstalled.trim()) missingFields.push("Фурнитура");
    if (!clientAccepted) missingFields.push("Подтверждение клиента");
    if (uploadedFiles.length === 0) missingFields.push("Фото / файлы");
  }

  return (
    <DashboardLayout role="installer" userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Мои заявки</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : activeRequests.length === 0 && doneRequests.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Нет активных заявок</p>
        ) : (
          <div className="space-y-3">
            {activeRequests.map((r) => (
              <Card
                key={r.id}
                onClick={() => handleSelectRequest(r)}
                className={`bg-white border-slate-200 cursor-pointer transition-all ${selected?.id === r.id ? "ring-2 ring-blue-500/30" : "hover:shadow-sm"}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{r.number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[r.status as RequestStatus] || r.status}
                      </span>
                      <span className="text-xs text-slate-500">{requestTypeLabels[r.type] || r.type}</span>
                    </div>
                    {r.accepted_at && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Принято</span>
                    )}
                  </div>
                  <div className="font-medium text-slate-800 mb-1">{r.client_name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(r.client_address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{r.client_address}</a>
                  </div>
                  {r.agreed_date && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Согласовано: {r.agreed_date.split("T")[0]}
                    </div>
                  )}
                  <div className="text-xs text-slate-300 mt-2">{r.created_at?.split("T")[0]}</div>
                </CardContent>
              </Card>
            ))}

            {doneRequests.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-slate-700 mt-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Выполнено
                </h2>
                {doneRequests.map((r) => (
                  <Card key={r.id} className="bg-white border-slate-200 opacity-60">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-400">{r.number}</span>
                        <span className="text-xs text-slate-500">{r.client_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                          {statusLabels[r.status as RequestStatus] || r.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <>
            {isMobile && (
              <div onClick={() => setSelected(null)} className="fixed inset-0 z-[84] bg-black/40" />
            )}
            <div className={`${isMobile ? "fixed inset-x-0 bottom-0 z-[85] max-h-[85vh] overflow-y-auto rounded-t-2xl" : "mt-6"} bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xl`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-slate-400">{selected.number}</span>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{selected.client_name}</h3>

              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selected.client_address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{selected.client_address}</a>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${selected.client_phone?.replace(/\s/g, "")}`}>{selected.client_phone}</a>
              </div>

              {(selected.interior_doors != null || selected.entrance_doors != null || selected.partitions != null) && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-wrap gap-3 text-sm text-slate-600">
                  {selected.interior_doors != null && <span>Межкомнатные: {selected.interior_doors}</span>}
                  {selected.entrance_doors != null && <span>Входные: {selected.entrance_doors}</span>}
                  {selected.partitions != null && <span>Перегородка: {selected.partitions}</span>}
                </div>
              )}

              {selected.extra_name && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">Доп. контакт</div>
                  <div className="text-sm text-slate-800">{selected.extra_name}</div>
                  {selected.extra_phone && <div className="text-sm text-slate-500">{selected.extra_phone}</div>}
                </div>
              )}

              {selected.notes && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-xs font-medium text-amber-700 mb-1">Заметки</div>
                  <div className="text-sm text-amber-800">{selected.notes}</div>
                </div>
              )}

              {selected.work_description && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-500 mb-1">Описание работ</div>
                  <div className="text-sm text-slate-700">{selected.work_description}</div>
                </div>
              )}

              {/* Existing photos */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">
                  Прикреплённые файлы {(selected.photos || []).length > 0 && `(${selected.photos!.length})`}
                </h4>
                {(selected.photos || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selected.photos!.map((file: any, i: number) => (
                      <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Нет прикреплённых файлов</p>
                )}
              </div>

              {/* Accept button */}
              {!selected.accepted_at && selected.status !== "closed" && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                  <div className="text-sm font-medium text-blue-800">Подтвердите принятие заявки</div>
                  <p className="text-xs text-blue-600">Нажмите, чтобы подтвердить что вы приняли эту заявку в работу</p>
                  <button
                    onClick={async () => {
                      try {
                        const updated = await updateRequest(selected.id, { accepted_at: new Date().toISOString() } as any);
                        setSelected(updated as ApiRequest);
                        toast.success("Заявка принята");
                      } catch {}
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4 inline mr-1" /> Принял
                  </button>
                </div>
              )}

              {selected.accepted_at && (
                <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  Принято: {new Date(selected.accepted_at).toLocaleString("ru-RU")}
                </div>
              )}

              {/* Date section */}
              {!selected.agreed_date && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-sm text-amber-800">{selected.type === "reclamation" ? "Ожидание даты визита" : "Ожидание даты монтажа"}</div>
                  <p className="text-xs text-amber-600">Дата будет назначена менеджером после согласования с клиентом.</p>
                </div>
              )}

              {selected.agreed_date && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <Calendar className="w-4 h-4" />
                      {selected.type === "reclamation" ? "Дата визита" : "Дата монтажа"}: {selected.agreed_date.split("T")[0]}
                    </div>
                    <button
                      onClick={() => setRescheduleOpen(!rescheduleOpen)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-blue-400/40 transition-colors"
                    >
                      {rescheduleOpen ? "Отменить перенос" : "Перенести дату"}
                    </button>
                  </div>

                  {rescheduleOpen && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                      <div className="text-sm font-medium text-amber-800">Перенос даты монтажа</div>
                      <p className="text-xs text-amber-600">Укажите новую дату и причину переноса.</p>
                      <input
                        type="date"
                        value={agreedDate}
                        onChange={(e) => setAgreedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <textarea
                        value={rescheduleComment}
                        onChange={(e) => setRescheduleComment(e.target.value)}
                        placeholder="Причина переноса..."
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[60px]"
                      />
                      <button
                        onClick={handleConfirmDate}
                        disabled={!agreedDate || !rescheduleComment.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
                      >
                        Подтвердить
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Completion form */}
              {selected.agreed_date && selected.status !== "closed" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700">
                    {isReclamation ? "Отчёт по рекламации" : "Отчёт о монтаже"}
                  </h4>

                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">{isReclamation ? "Описание выполненных работ *" : "Установленные двери *"}</label>
                    <textarea
                      value={doorsInstalled}
                      onChange={(e) => setDoorsInstalled(e.target.value)}
                      placeholder={isReclamation ? "Что было сделано..." : "Какие двери установлены, кол-во..."}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[60px]"
                    />
                  </div>

                  {!isReclamation && (
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Фурнитура *</label>
                      <input
                        type="text"
                        value={hardwareInstalled}
                        onChange={(e) => setHardwareInstalled(e.target.value)}
                        placeholder="Замки, ручки, петли..."
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Дефекты / замечания</label>
                    <textarea
                      value={defects}
                      onChange={(e) => setDefects(e.target.value)}
                      placeholder="Если есть замечания..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[50px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={clientAccepted}
                      onChange={(e) => setClientAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-slate-700">Клиент принял работу *</label>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Фото результата *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadedFiles.map((url, i) => (
                        <div key={i} className="relative group">
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Camera className="w-6 h-6" />
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Загрузка..." : "Загрузить фото"}
                      <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>

                  {missingFields.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 space-y-1">
                      <div className="flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> Не заполнены:</div>
                      {missingFields.map((f, i) => <div key={i}>• {f}</div>)}
                    </div>
                  )}

                  <button
                    onClick={handleComplete}
                    className="w-full py-3 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isReclamation ? "Рекламация закрыта" : "Монтаж завершён"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstallerDashboard;
