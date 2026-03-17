import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { roleLabels, type UserRole } from "@/data/mockDashboard";
import { UserPlus, Search, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const roleColorMap: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-700",
  manager: "bg-blue-50 text-blue-700",
  measurer: "bg-purple-50 text-purple-700",
  installer: "bg-orange-50 text-orange-700",
  partner: "bg-green-50 text-green-700",
};

const demoUsers = [
  { id: "U-001", name: "Корженевский М.А.", role: "admin" as UserRole, phone: "+7 900 000 00 01", active: true, created_at: "2024-01-15" },
  { id: "U-002", name: "Смирнова Е.П.", role: "manager" as UserRole, phone: "+7 900 000 00 02", active: true, created_at: "2024-03-10" },
  { id: "U-003", name: "Сидоров К.В.", role: "measurer" as UserRole, phone: "+7 900 000 00 03", active: true, created_at: "2024-05-20" },
  { id: "U-004", name: "Морозов А.И.", role: "measurer" as UserRole, phone: "+7 900 000 00 04", active: true, created_at: "2024-06-01" },
  { id: "U-005", name: "Бригада №1", role: "installer" as UserRole, phone: "+7 900 000 00 05", active: true, created_at: "2024-02-01" },
  { id: "U-006", name: "Бригада №2", role: "installer" as UserRole, phone: "+7 900 000 00 06", active: true, created_at: "2024-02-15" },
  { id: "U-007", name: "Бригада №3", role: "installer" as UserRole, phone: "+7 900 000 00 07", active: false, created_at: "2024-04-10" },
  { id: "U-008", name: "ООО РемонтПро", role: "partner" as UserRole, phone: "+7 900 000 00 08", active: true, created_at: "2025-01-10" },
  { id: "U-009", name: "ИП Строев", role: "partner" as UserRole, phone: "+7 900 000 00 09", active: true, created_at: "2025-02-01" },
];

const AdminAccounts = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");

  useEffect(() => { document.title = "Аккаунты — Админ-панель"; }, []);

  const filtered = demoUsers.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Аккаунты</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Новый аккаунт
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "admin", "manager", "measurer", "installer", "partner"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterRole === role
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {role === "all" ? "Все" : roleLabels[role]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <Card className="bg-white border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Имя</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Роль</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Создан</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{u.phone}</td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Активен
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Неактивен
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAccounts;
