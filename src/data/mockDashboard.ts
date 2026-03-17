// Status and type definitions for the request system

export type RequestStatus =
  | "new"
  | "pending"
  | "measurer_assigned"
  | "date_agreed"
  | "installation_rescheduled"
  | "measurement_done"
  | "closed"
  | "client_refused"
  | "cancelled";

export type RequestType = "measurement" | "installation" | "reclamation";

export const getStatusLabel = (status: RequestStatus, type?: RequestType): string => {
  if (status === "date_agreed") {
    if (type === "measurement") return "Дата замера согласована";
    if (type === "installation") return "Дата монтажа согласована";
    return "Дата согласована";
  }
  return statusLabels[status] || status;
};

export const statusLabels: Record<RequestStatus, string> = {
  new: "Новая",
  pending: "В ожидании",
  measurer_assigned: "Замерщик назначен",
  date_agreed: "Дата согласована",
  installation_rescheduled: "Монтаж перенесён",
  measurement_done: "Замер выполнен",
  closed: "Закрыта",
  client_refused: "Отказ клиента",
  cancelled: "Отменена",
};

export const statusColors: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  measurer_assigned: "bg-amber-100 text-amber-700",
  date_agreed: "bg-cyan-100 text-cyan-700",
  installation_rescheduled: "bg-rose-100 text-rose-700",
  measurement_done: "bg-purple-100 text-purple-700",
  closed: "bg-emerald-100 text-emerald-700",
  client_refused: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export const statusFlows: Record<RequestType, RequestStatus[]> = {
  measurement: ["new", "pending", "measurer_assigned", "date_agreed", "measurement_done", "closed"],
  installation: ["new", "pending", "date_agreed", "installation_rescheduled", "closed"],
  reclamation: ["new", "pending", "date_agreed", "closed"],
};

export const getNextStatuses = (currentStatus: RequestStatus, type: RequestType): RequestStatus[] => {
  const flow = statusFlows[type];
  const currentIndex = flow.indexOf(currentStatus);
  const options: RequestStatus[] = [];

  if (currentIndex >= 0 && currentIndex < flow.length - 1) {
    options.push(flow[currentIndex + 1]);
  }

  if (type === "installation" && currentStatus === "installation_rescheduled") {
    if (!options.includes("date_agreed")) {
      options.unshift("date_agreed");
    }
  }

  if (!["closed", "cancelled", "client_refused"].includes(currentStatus)) {
    options.push("cancelled");
  }

  if (currentStatus === "new" && !options.includes("pending")) {
    options.push("pending");
  }

  return [...new Set(options)];
};

export const requestTypeLabels: Record<RequestType, string> = {
  measurement: "Замер",
  installation: "Монтаж",
  reclamation: "Рекламация",
};

export type RequestSource = "site" | "partner";

export const sourceLabels: Record<RequestSource, string> = {
  site: "Сайт",
  partner: "Партнёр",
};

export type UserRole = "admin" | "manager" | "measurer" | "installer" | "partner";

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  measurer: "Замерщик",
  installer: "Монтажник",
  partner: "Партнёр",
};
