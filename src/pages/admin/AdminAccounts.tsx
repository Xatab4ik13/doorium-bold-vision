import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { roleLabels, type UserRole } from "@/data/mockDashboard";
import { UserPlus, Trash2, Search, CheckCircle } from "lucide-react";
import CreateAccountModal from "@/components/dashboard/CreateAccountModal";
import AccountDetailModal from "@/components/dashboard/AccountDetailModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { demoUsers } from "@/data/demoData";

interface UserAccount { id: string; name: string; role: UserRole; phone?: string; email?: string; notes?: string; active: boolean; created_at: string; }

const roleColorMap: Record<UserRole, string> = { admin: "bg-red-50 text-red-700", manager: "bg-blue-50 text-blue-700", measurer: "bg-purple-50 text-purple-700", installer: "bg-orange-50 text-orange-700", partner: "bg-green-50 text-green-700" };

const AdminAccounts = () => {
  const isMobile = useIsMobile();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>(demoUsers.filter(u => u.role !== "admin").map(u => ({ ...u, role: u.role as UserRole, created_at: "2026-03-01T10:00:00Z" })));
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserAccount | null>(null);

  useEffect(() => { document.title = "Аккаунты — Админ-панель"; }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.name.toLowerCase().includes(q) || (u.phone || "").includes(search)) && (filterRole === "all" || u.role === filterRole);
  });

  return (
    <DashboardLayout role="admin" userName={authUser?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Аккаунты</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"><UserPlus className="w-4 h-4" />Создать</button>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="all">Все роли</option>
            {(Object.entries(roleLabels) as [UserRole, string][]).filter(([k]) => k !== "admin").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <Card className="bg-white border-slate-200 overflow-hidden">
          {isMobile ? (
            <div className="p-3 space-y-2">
              {filtered.map(u => (
                <div key={u.id} onClick={() => setDetailTarget(u)} className={`p-3.5 rounded-xl border border-slate-200/50 cursor-pointer ${!u.active ? "bg-amber-50/30" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-800">{u.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${roleColorMap[u.role]}`}>{roleLabels[u.role]}</span></div>
                  <div className="text-xs text-slate-400">{u.phone || "—"}</div>
                </div>
              ))}
              {filtered.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Аккаунты не найдены</div>}
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50/50"><th className="text-left px-4 py-3 font-medium text-slate-500">Имя</th><th className="text-left px-4 py-3 font-medium text-slate-500">Телефон</th><th className="text-left px-4 py-3 font-medium text-slate-500">Роль</th><th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th><th className="text-left px-4 py-3 font-medium text-slate-500">Создан</th><th className="text-left px-4 py-3 font-medium text-slate-500"></th></tr></thead>
              <tbody>{filtered.map(u => (
                <tr key={u.id} onClick={() => setDetailTarget(u)} className="border-b border-slate-50 hover:bg-blue-50/30 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${roleColorMap[u.role]}`}>{roleLabels[u.role]}</span></td>
                  <td className="px-4 py-3 text-xs">{u.active ? <span className="text-green-600">Активен</span> : <span className="text-amber-600">Ожидает</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.created_at?.split("T")[0]}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">{!u.active && <button onClick={e => { e.stopPropagation(); setUsers(p => p.map(x => x.id === u.id ? { ...x, active: true } : x)); toast.success("Активирован"); }} className="text-green-600 p-1"><CheckCircle className="w-4 h-4" /></button>}<button onClick={e => { e.stopPropagation(); setDeleteTarget(u); }} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}</tbody></table>
              {filtered.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Аккаунты не найдены</div>}
            </div>
          )}
        </Card>
      </div>
      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onSave={async (d) => { setUsers(p => [{ id: `u${Date.now()}`, ...d, active: true, created_at: new Date().toISOString() }, ...p]); toast.success(`Аккаунт "${d.name}" создан`); }} />}
      {deleteTarget && <DeleteConfirmModal title="Удалить аккаунт?" description={`Удалить "${deleteTarget.name}"?`} onClose={() => setDeleteTarget(null)} onConfirm={() => { setUsers(p => p.filter(u => u.id !== deleteTarget.id)); toast.success("Удалён"); setDeleteTarget(null); }} />}
      {detailTarget && <AccountDetailModal user={detailTarget} onClose={() => setDetailTarget(null)} onSave={async (id, upd) => { setUsers(p => p.map(u => u.id === id ? { ...u, ...upd } : u)); toast.success("Обновлён"); }} />}
    </DashboardLayout>
  );
};
export default AdminAccounts;
