import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Newspaper, FileSpreadsheet,
  Wrench, LogOut, Menu, X, ChevronLeft,
  History, Upload, PlusCircle, Calculator, CalendarDays, Handshake,
} from "lucide-react";
import type { UserRole } from "@/data/mockDashboard";
import { roleLabels } from "@/data/mockDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImg from "@/assets/doorium-logo-new.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Дашборд", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Заявки", href: "/admin/requests", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Календарь", href: "/admin/calendar", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Сметы", href: "/admin/estimates", icon: <Calculator className="w-5 h-5" /> },
    { label: "Аккаунты", href: "/admin/accounts", icon: <Users className="w-5 h-5" /> },
    { label: "Партнёры", href: "/admin/partners", icon: <Handshake className="w-5 h-5" /> },
    { label: "Новости", href: "/admin/news", icon: <Newspaper className="w-5 h-5" /> },
  ],
  manager: [
    { label: "Заявки", href: "/manager", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Календарь", href: "/manager/calendar", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Распределение", href: "/manager/assign", icon: <Users className="w-5 h-5" /> },
    { label: "Файлы", href: "/manager/files", icon: <Upload className="w-5 h-5" /> },
    { label: "Сметы", href: "/manager/estimates", icon: <FileSpreadsheet className="w-5 h-5" /> },
  ],
  measurer: [
    { label: "Мои заявки", href: "/measurer", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Календарь", href: "/measurer/calendar", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "История", href: "/measurer/history", icon: <History className="w-5 h-5" /> },
  ],
  installer: [
    { label: "Мои заявки", href: "/installer", icon: <Wrench className="w-5 h-5" /> },
    { label: "Календарь", href: "/installer/calendar", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Сметы", href: "/installer/estimates", icon: <Calculator className="w-5 h-5" /> },
    { label: "История", href: "/installer/history", icon: <History className="w-5 h-5" /> },
  ],
  partner: [
    { label: "Мои заявки", href: "/partner", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Новая заявка", href: "/partner/new", icon: <PlusCircle className="w-5 h-5" /> },
    { label: "История", href: "/partner/history", icon: <History className="w-5 h-5" /> },
  ],
};

interface DashboardLayoutProps {
  role: UserRole;
  userName?: string;
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

const DashboardLayout = ({ role, userName = "Пользователь", children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const items = navByRole[role];
  const displayName = user?.name || userName;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href: string) => {
    if (href === `/${role}` || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 dashboard-theme">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Doorium" className="h-8 w-auto" />
            <span className="text-sm font-medium text-slate-600">{roleLabels[role]}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="px-4 py-4 pb-24">
          {children}
        </main>

        {/* Mobile tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-around">
            {items.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {item.icon}
                <span className="mt-1 truncate max-w-[60px]">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex min-h-screen bg-slate-50 dashboard-theme">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Doorium" className="h-8 w-auto" />
            {sidebarOpen && (
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {roleLabels[role]}
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{displayName}</div>
                <div className="text-xs text-slate-500">{roleLabels[role]}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6">
          <h2 className="text-sm font-medium text-slate-600">
            {items.find(i => isActive(i.href))?.label || "Панель управления"}
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
