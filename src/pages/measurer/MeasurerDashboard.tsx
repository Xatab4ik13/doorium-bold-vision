import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, FileText, Camera, X, ChevronRight, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const MeasurerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ApiRequest | null>(null);

  const [measurementNotes, setMeasurementNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  useEffect(() => { document.title = "Мои заявки — Замерщик"; }, []);

  const handleSelectRequest = (r: ApiRequest) => {
    setSelected(r);
    setMeasurementNotes(r.notes || "");
    setUploadedFiles([]);
    setAgreedDate(r.agreed_date?.split("T")[0] || "");
    setDateConfirmed(!!r.agreed_date);
    setRescheduleOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    // Demo mode: simulate upload
    setTimeout(() => {
      const newUrls = files.map((f, i) => `demo://uploads/${Date.now()}_${i}_${f.name}`);
      setUploadedFiles(prev => [...prev, ...newUrls]);
      toast.success(`Загружено: ${files.length}`);
      setUploading(false);
    }, 800);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = async () => {
    if (!agreedDate || !selected) return;
    try {
      const updated = await updateRequest(selected.id, { agreed_date: agreedDate, status: "date_agreed" as any });
      setDateConfirmed(true);
      setSelected(updated as ApiRequest);
      toast.success("Дата согласована");
    } catch {}
  };

  const canComplete = dateConfirmed && measurementNotes.trim() && uploadedFiles.length > 0;

  const handleComplete = async () => {
    if (!selected || !canComplete) return;
    try {
      const newPhotos = uploadedFiles.map(url => ({ url, type: "image", stage: "general", uploaded_at: new Date().toISOString() }));
      const existingPhotos = selected.photos || [];
      await updateRequest(selected.id, {
        status: "measurement_done" as any,
        notes: measurementNotes,
        photos: [...existingPhotos, ...newPhotos] as any,
      });
      setSelected(null);
      toast.success("Замер завершён");
    } catch {}
  };

  const activeRequests = requests.filter((r) => !["measurement_done", "closed", "cancelled"].includes(r.status));
  const doneRequests = requests.filter((r) => ["measurement_done", "closed"].includes(r.status));

  return (
    <DashboardLayout role="measurer" userName={user?.name}>
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
                    </div>
                    {r.partner_id && (
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{r.partner_name || "Партнёр"}</span>
                    )}
                  </div>
                  <div className="font-medium text-slate-800 mb-1">{r.client_name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(r.client_address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{r.client_address}</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${r.client_phone?.replace(/\s/g, "")}`}>{r.client_phone}</a>
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Замер выполнен
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
                <div>
                  <span className="font-mono text-sm text-slate-400">{selected.number}</span>
                  {selected.partner_id && (
                    <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{selected.partner_name || "Партнёр"}</span>
                  )}
                </div>
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

              {/* Date confirmation */}
              {!dateConfirmed && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <div className="text-sm font-medium text-amber-800">Выберите дату замера</div>
                  <p className="text-xs text-amber-600">Укажите дату, которую согласовали с клиентом.</p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={agreedDate}
                      onChange={(e) => setAgreedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleConfirmDate} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Подтвердить</button>
                  </div>
                </div>
              )}

              {dateConfirmed && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <Calendar className="w-4 h-4" />
                      Согласованная дата: {agreedDate}
                    </div>
                    {selected.status !== "measurement_done" && selected.status !== "closed" && (
                      <button
                        onClick={() => setRescheduleOpen(!rescheduleOpen)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-blue-400/40 transition-colors"
                      >
                        {rescheduleOpen ? "Отменить" : "Перенести дату"}
                      </button>
                    )}
                  </div>

                  {rescheduleOpen && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                      <div className="text-sm font-medium text-amber-800">Перенос даты замера</div>
                      <p className="text-xs text-amber-600">Укажите новую дату.</p>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={agreedDate}
                          onChange={(e) => setAgreedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          onClick={async () => {
                            if (!agreedDate || !selected) return;
                            try {
                              const updated = await updateRequest(selected.id, { agreed_date: agreedDate, status: "date_agreed" as any });
                              setDateConfirmed(true);
                              setRescheduleOpen(false);
                              setSelected(updated as ApiRequest);
                              toast.success("Дата перенесена");
                            } catch {}
                          }}
                          disabled={!agreedDate || agreedDate === selected.agreed_date?.split("T")[0]}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
                        >
                          Подтвердить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Measurement data */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Данные замера</h4>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Заметки по замеру *</label>
                      <textarea
                        value={measurementNotes}
                        onChange={(e) => setMeasurementNotes(e.target.value)}
                        placeholder="Размеры проёмов, особенности, рекомендации..."
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Фото замера *</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {uploadedFiles.map((url, i) => (
                          <div key={i} className="relative group">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <Camera className="w-6 h-6" />
                            </div>
                            <button
                              onClick={() => handleRemoveFile(i)}
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
                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className="w-full py-3 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Замер завершён
                  </button>

                  {!canComplete && (
                    <div className="flex items-start gap-2 text-xs text-amber-600">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Для завершения нужно: согласовать дату, заполнить заметки и загрузить фото</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MeasurerDashboard;
