import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, MapPin, FileText, Upload, X, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AddressInput from "@/components/AddressInput";
import { formatPhone } from "@/lib/formatPhone";
import { useRequests } from "@/hooks/useRequests";
import { useNavigate } from "react-router-dom";

const requestTypes = [
  { value: "measurement", label: "Замер", desc: "Выезд специалиста для замера проёмов" },
  { value: "installation", label: "Монтаж", desc: "Установка дверей на объекте" },
  { value: "reclamation", label: "Рекламация", desc: "Гарантийное обслуживание (бесплатно)" },
];

const cities = ["Москва", "Санкт-Петербург"];

const PartnerNewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createRequest } = useRequests();
  const [type, setType] = useState("measurement");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [comment, setComment] = useState("");
  const [interiorDoors, setInteriorDoors] = useState("");
  const [entranceDoors, setEntranceDoors] = useState("");
  const [partitions, setPartitions] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<{ file: File; preview?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = "Новая заявка — Партнёр"; }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!city) e.city = "Выберите город";
    if (!address.trim()) e.address = "Укажите адрес";
    if (phone.replace(/\D/g, "").length < 11) e.phone = "Введите корректный номер";
    if (!contactName.trim()) e.contactName = "Укажите контактное лицо";
    if (type === "reclamation" && !comment.trim()) e.comment = "Опишите проблему";
    if (!agree) e.agree = "Необходимо согласие";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createRequest({
        client_name: contactName,
        client_phone: phone,
        client_address: address,
        city,
        type: type as any,
        work_description: comment,
        extra_name: extraName || undefined,
        extra_phone: extraPhone || undefined,
        source: "partner",
        ...(type === "installation" ? {
          interior_doors: interiorDoors ? parseInt(interiorDoors) : undefined,
          entrance_doors: entranceDoors ? parseInt(entranceDoors) : undefined,
          partitions: partitions ? parseInt(partitions) : undefined,
        } : {}),
      } as any);
      setSubmitted(true);
      toast.success("Заявка успешно отправлена!");
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setType("measurement");
    setCity("");
    setAddress("");
    setPhone("");
    setContactName("");
    setExtraName("");
    setExtraPhone("");
    setComment("");
    setInteriorDoors("");
    setEntranceDoors("");
    setPartitions("");
    setAgree(false);
    setSubmitted(false);
    setErrors({});
    setFiles([]);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined }))]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const f = prev[index];
      if (f.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
      errors[field] ? "border-red-400" : "border-slate-200"
    }`;

  if (submitted) {
    return (
      <DashboardLayout role="partner" userName={user?.name}>
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Заявка отправлена!</h2>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">Ваша заявка принята в обработку. Вы можете отслеживать её статус в разделе «Мои заявки».</p>
          <div className="flex gap-3">
            <button onClick={handleReset} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Создать ещё
            </button>
            <button onClick={() => navigate("/partner")} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
              К моим заявкам
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="partner" userName={user?.name}>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Новая заявка</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Тип заявки</label>
            <div className="grid grid-cols-3 gap-2">
              {requestTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-lg text-left transition-colors border-2 ${
                    type === t.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Город *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass("city")}>
              <option value="">Выберите город</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Адрес *</label>
            <AddressInput value={address} onChange={setAddress} city={city} />
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Телефон на объекте *</label>
            <input type="tel" value={phone} onChange={handlePhoneChange} className={inputClass("phone")} placeholder="+7 ___ ___ __ __" />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Contact name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Контактное лицо *</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass("contactName")} placeholder="Иванов Иван Иванович" />
            {errors.contactName && <p className="text-xs text-red-500">{errors.contactName}</p>}
          </div>

          {/* Extra contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Доп. контакт</label>
              <input type="text" value={extraName} onChange={(e) => setExtraName(e.target.value)} className={inputClass("")} placeholder="ФИО" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Доп. телефон</label>
              <input type="tel" value={extraPhone} onChange={(e) => setExtraPhone(formatPhone(e.target.value))} className={inputClass("")} placeholder="+7 ..." />
            </div>
          </div>

          {/* Door counts (for installation) */}
          {type === "installation" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Межкомнатные двери</label>
                <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)} className={inputClass("")} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Входные двери</label>
                <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)} className={inputClass("")} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Перегородки</label>
                <input type="number" min="0" value={partitions} onChange={(e) => setPartitions(e.target.value)} className={inputClass("")} placeholder="0" />
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{type === "reclamation" ? "Описание проблемы *" : "Комментарий"}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`${inputClass("comment")} min-h-[80px]`}
              placeholder={type === "reclamation" ? "Опишите проблему подробно..." : "Дополнительная информация"}
            />
            {errors.comment && <p className="text-xs text-red-500">{errors.comment}</p>}
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Фото / документы</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  {f.preview ? (
                    <img src={f.preview} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" /> Прикрепить файлы
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={addFiles} className="hidden" />
            </label>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-slate-600">
              Я подтверждаю, что клиент согласен на обработку данных и выезд специалиста
            </label>
          </div>
          {errors.agree && <p className="text-xs text-red-500">{errors.agree}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PartnerNewRequest;
