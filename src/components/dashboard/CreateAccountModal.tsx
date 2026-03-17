import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { roleLabels, type UserRole } from "@/data/mockDashboard";

interface Props {
  onClose: () => void;
  onSave: (data: { name: string; role: UserRole; phone: string; pin: string; email?: string; notes?: string }) => Promise<void>;
}

const roles: UserRole[] = ["manager", "measurer", "installer", "partner"];

const CreateAccountModal = ({ onClose, onSave }: Props) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("measurer");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !pin.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), role, phone: phone.trim(), pin: pin.trim(), email: email.trim() || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый аккаунт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ФИО *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Роль</label>
            <div className="flex gap-2 flex-wrap">
              {roles.map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${role === r ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Телефон *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="+7 " />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ПИН-код *</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="1234" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !phone.trim() || !pin.trim() || saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Создать аккаунт
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountModal;
