import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Handshake } from "lucide-react";
import { demoPartnerForms } from "@/data/demoData";

interface PF { id: number; name: string; store_name: string; store_address: string; phone: string; email: string; status: string; notes: string | null; created_at: string; }
const sL: Record<string, string> = { new: "Новая", in_progress: "В работе", done: "Завершена", rejected: "Отклонена" };
const sC: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", done: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

const AdminPartners = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [forms, setForms] = useState<PF[]>(demoPartnerForms as PF[]);
  const [selected, setSelected] = useState<PF | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const handleOpen = (f: PF) => { setSelected(f); setEditNotes(f.notes || ""); setEditStatus(f.status); };
  const handleSave = () => { if (!selected) return; setForms(p => p.map(f => f.id === selected.id ? { ...f, status: editStatus, notes: editNotes } : f)); toast.success("Сохранено"); setSelected(null); };
  const handleDelete = (id: number) => { setForms(p => p.filter(f => f.id !== id)); toast.success("Удалено"); };

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-slate-900">Заявки на партнёрство</h1><Badge variant="secondary">{forms.length}</Badge></div>
        {forms.length === 0 ? <div className="py-16 text-center"><Handshake className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 text-sm">Заявок пока нет</p></div> : isMobile ? (
          <div className="space-y-2">{forms.map(f => (
            <div key={f.id} onClick={() => handleOpen(f)} className="bg-white rounded-xl border border-slate-200/50 p-3.5 cursor-pointer">
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-800">{f.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${sC[f.status]}`}>{sL[f.status]}</span></div>
              <div className="text-xs text-slate-500">{f.store_name}</div>
              <div className="flex items-center justify-between mt-2"><a href={`tel:${f.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600">{f.phone}</a><button onClick={e => { e.stopPropagation(); handleDelete(f.id); }} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}</div>
        ) : (
          <Table><TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>ФИО</TableHead><TableHead>Магазин</TableHead><TableHead>Телефон</TableHead><TableHead>Email</TableHead><TableHead>Статус</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader>
            <TableBody>{forms.map(f => (
              <TableRow key={f.id}><TableCell className="text-xs">{new Date(f.created_at).toLocaleDateString("ru-RU")}</TableCell><TableCell className="font-medium">{f.name}</TableCell><TableCell>{f.store_name}</TableCell><TableCell><a href={`tel:${f.phone}`} className="text-blue-600">{f.phone}</a></TableCell><TableCell><a href={`mailto:${f.email}`} className="text-blue-600">{f.email}</a></TableCell><TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${sC[f.status]}`}>{sL[f.status]}</span></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleOpen(f)}><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </div>
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Заявка на партнёрство</DialogTitle></DialogHeader>
          {selected && (<div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-slate-500">ФИО</div><div className="font-medium">{selected.name}</div></div>
              <div><div className="text-xs text-slate-500">Магазин</div><div className="font-medium">{selected.store_name}</div></div>
              <div><div className="text-xs text-slate-500">Телефон</div><a href={`tel:${selected.phone}`} className="font-medium text-blue-600">{selected.phone}</a></div>
              <div><div className="text-xs text-slate-500">Email</div><a href={`mailto:${selected.email}`} className="font-medium text-blue-600">{selected.email}</a></div>
            </div>
            <div><div className="text-xs text-slate-500 mb-1">Статус</div><Select value={editStatus} onValueChange={setEditStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">Новая</SelectItem><SelectItem value="in_progress">В работе</SelectItem><SelectItem value="done">Завершена</SelectItem><SelectItem value="rejected">Отклонена</SelectItem></SelectContent></Select></div>
            <div><div className="text-xs text-slate-500 mb-1">Заметки</div><Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} /></div>
            <div className="flex gap-2"><Button onClick={handleSave} className="flex-1">Сохранить</Button>{editStatus !== "done" && <Button variant="outline" onClick={() => { setForms(p => p.map(f => f.id === selected.id ? { ...f, status: "done" } : f)); setEditStatus("done"); toast.success("Аккаунт партнёра создан!"); }} className="flex-1"><Handshake className="w-4 h-4 mr-2" />Создать аккаунт</Button>}</div>
          </div>)}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
export default AdminPartners;
