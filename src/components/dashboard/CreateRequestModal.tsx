import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, X } from "lucide-react";
import type { ApiRequest } from "@/hooks/useRequests";
import { formatPhone } from "@/lib/formatPhone";

const requestTypes = [
  { value: "measurement", label: "Замер" },
  { value: "installation", label: "Монтаж" },
  { value: "reclamation", label: "Рекламация" },
];

const cities = ["Москва", "СПб"];

interface Props {
  onClose: () => void;
  onCreate: (data: Partial<ApiRequest>) => Promise<any>;
}

const CreateRequestModal = ({ onClose, onCreate }: Props) => {
  const [type, setType] = useState("measurement");
  const [city, setCity] = useState("Москва");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [interiorDoors, setInteriorDoors] = useState("");
  const [entranceDoors, setEntranceDoors] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!clientName.trim() || !clientPhone.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        type: type as any,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_address: clientAddress.trim(),
        city,
        work_description: workDescription.trim(),
        interior_doors: interiorDoors ? parseInt(interiorDoors) : undefined,
        entrance_doors: entranceDoors ? parseInt(entranceDoors) : undefined,
        source: "site",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая заявка</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Тип заявки</label>
            <div className="flex gap-2">
              {requestTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === t.value ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Город</label>
            <div className="flex gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    city === c ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ФИО клиента *</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Телефон *</label>
            <input value={clientPhone} onChange={(e) => setClientPhone(formatPhone(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="+7 " />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Адрес</label>
            <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Межком. двери</label>
              <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Входные двери</label>
              <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Описание работ</label>
            <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!clientName.trim() || !clientPhone.trim() || submitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Создать заявку
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestModal;
