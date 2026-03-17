import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/doorium-logo-new.png";
import { ArrowLeft, Loader2, User, Phone as PhoneIcon, Building2 } from "lucide-react";
import api from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";
import { isCrmDomain } from "@/hooks/useCrmDomain";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isCrm = isCrmDomain();

  useEffect(() => {
    document.title = "Регистрация — Doorium Service";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: { name: name.trim(), phone: phone.trim(), company: company.trim() || undefined },
      });
      toast.success("Заявка на регистрацию отправлена! Ожидайте подтверждения.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link to={isCrm ? "/login" : "/"}>
            <img src={logo} alt="Doorium Service" className="h-52 w-auto mx-auto mb-8 brightness-0 invert" />
          </Link>
          <h1 className="heading-md">Регистрация</h1>
          <p className="text-xs text-muted-foreground mt-3">
            Заполните форму для создания аккаунта партнёра
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <User size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Контактные данные</p>
          </div>

          <input
            type="text"
            placeholder="ФИО"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoFocus
            maxLength={100}
          />

          <input
            type="tel"
            placeholder="+7 ___ ___ __ __"
            required
            value={phone}
            onFocus={(e) => { if (!e.target.value) setPhone("+7"); }}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className={inputClass}
          />

          <div className="flex items-center gap-2 mt-8 mb-4 px-1">
            <Building2 size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Компания (необязательно)</p>
          </div>

          <input
            type="text"
            placeholder="Название компании"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputClass}
            maxLength={100}
          />

          <div className="pt-10">
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Отправка...</> : "Зарегистрироваться"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/login" className="hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> Уже есть аккаунт? Войти
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default RegisterPage;
