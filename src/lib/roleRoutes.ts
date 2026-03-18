export type AppRole = "admin" | "manager" | "measurer" | "installer" | "partner";

export const ROLE_DASHBOARD_ROUTES: Record<AppRole, string> = {
  admin: "/admin",
  manager: "/manager",
  measurer: "/measurer",
  installer: "/installer",
  partner: "/partner/dashboard",
};

export const getRoleDashboardRoute = (role?: string | null) => {
  if (!role) return "/login";
  return ROLE_DASHBOARD_ROUTES[role as AppRole] || "/login";
};
