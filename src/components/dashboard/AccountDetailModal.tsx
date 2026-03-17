import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { roleLabels, type UserRole } from "@/data/mockDashboard";

interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  telegram_id?: string;
  notes?: string;
  active: boolean;
  created_at: string;
}

interface Props {
  user: UserAccount;
  onClose: () => void;
  onSave: (id: string, updates: Partial<UserAccount>) => Promise<void>;
}

const AccountDetailModal = ({ user, onClose, onSave }: Props) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [notes, setNotes] = useState(user.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, { name, phone, email, notes });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {user.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{roleLabels[user.role]}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ФИО</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Телефон</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Заметки</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Статус: {user.active ? "Активен" : "Ожидает"}</span>
            <span>Создан: {user.created_at?.split("T")[0]}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailModal;
