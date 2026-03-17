import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatPhone } from "@/lib/formatPhone";

const requestTypes = [
  { value: "measurement", label: "Замер", desc: "Выезд специалиста для замера проёмов" },
  { value: "installation", label: "Монтаж", desc: "Установка дверей на объекте" },
  { value: "reclamation", label: "Рекламация", desc: "Гарантийное обслуживание" },
];

const PartnerNewRequest = () => {
  const { user } = useAuth();
  const [type, setType] = useState("measurement");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone || !contactName) {
      toast.error("Заполните обязательные поля");
      return;
    }
    setSubmitted(true);
    toast.success("Заявка создана! (демо)");
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

  if (submitted) {
    return (
      <DashboardLayout role="partner" userName={user?.name}>
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Заявка отправлена!</h2>
          <p className="text-sm text-slate-500 mb-6">Менеджер свяжется с клиентом в ближайшее время</p>
          <button onClick={() => { setSubmitted(false); setAddress(""); setPhone(""); setContactName(""); setComment(""); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Создать ещё
          </button>
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
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${type === t.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Имя клиента *</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} placeholder="ФИО клиента" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Телефон клиента *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={inputClass} placeholder="+7 ___ ___ __ __" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Адрес *</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Улица, дом, квартира" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Комментарий</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="Дополнительная информация" />
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Отправить заявку
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PartnerNewRequest;
