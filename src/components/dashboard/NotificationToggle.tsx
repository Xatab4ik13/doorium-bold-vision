import { Bell } from "lucide-react";

const NotificationToggle = () => (
  <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground" title="Уведомления (демо)">
    <Bell size={18} />
  </button>
);

export default NotificationToggle;
