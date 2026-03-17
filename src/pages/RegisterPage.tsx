import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/doorium-logo-new.png";
import { Loader2, User, Phone as PhoneIcon, Lock, Send as SendIcon, HelpCircle } from "lucide-react";
import api from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { isCrmDomain } from "@/hooks/useCrmDomain";

const roles = [
  { value: "measurer", label: "Замерщик" },
  { value: "installer", label: "Монтажник" },
  { value: "partner", label: "Партнёр" },
];

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [role, setRole] = useState("measurer");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isCrm = isCrmDomain();

  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a + b };
  }, []);

  useEffect(() => {
    document.title = "Регистрация — Doorium Service";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || pin.length !== 4 || !telegramId.trim()) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    if (parseInt(captchaAnswer) !== captcha.answer) {
      toast.error("Неверный ответ на проверку");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: {
          name: name.trim(),
          phone: phone.trim(),
          pin,
          role,
          telegram_id: telegramId.trim(),
        },
      });
      toast.success("Заявка на регистрацию отправлена! Ожидайте подтверждения администратора.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-white/15 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors duration-500";

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "hsl(0 0% 4%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to={isCrm ? "/login" : "/"}>
            <img src={logo} alt="Doorium Service" className="h-44 w-auto mx-auto mb-4 brightness-0 invert" />
          </Link>
          <h1
            className="text-3xl md:text-4xl font-light tracking-wide text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Регистрация
          </h1>
          <p className="text-xs text-white/40 mt-3">
            Заполните данные — после одобрения администратором вы сможете войти
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Name */}
          <div className="relative">
            <User size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="ФИО или название компании"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} pl-6`}
              autoFocus
              maxLength={100}
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <PhoneIcon size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="tel"
              placeholder="+7 ___ ___ __ __"
              required
              value={phone}
              onFocus={(e) => { if (!e.target.value) setPhone("+7"); }}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={`${inputClass} pl-6`}
            />
          </div>

          {/* PIN code */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-white/30" />
              <p className="text-xs text-white/40">Придумайте 4-значный ПИН-код</p>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold rounded-lg border border-white/15 bg-transparent text-white" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold rounded-lg border border-white/15 bg-transparent text-white" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold rounded-lg border border-white/15 bg-transparent text-white" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold rounded-lg border border-white/15 bg-transparent text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Telegram ID */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <SendIcon size={14} className="text-white/30" />
              <p className="text-xs text-white/40">
                Telegram ID <span className="text-red-400">*</span>
              </p>
            </div>
            <input
              type="text"
              placeholder="123456789"
              required
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
              maxLength={20}
            />
            <a
              href="https://t.me/Doorium_service?start=myid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-white/25 mt-2 hover:text-white/50 transition-colors"
            >
              <HelpCircle size={12} /> Не знаете свой ID? Узнайте через нашего бота
            </a>
          </div>

          {/* Role */}
          <div className="pt-6">
            <p className="text-xs text-white/40 mb-3">Выберите роль</p>
            <div className="flex gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    role === r.value
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Captcha */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={14} className="text-white/30" />
              <p className="text-xs text-white/40">
                Проверка: {captcha.a} + {captcha.b} = ?
              </p>
            </div>
            <input
              type="text"
              placeholder="Ответ"
              required
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
              maxLength={3}
            />
          </div>

          {/* Submit */}
          <div className="pt-8">
            <button
              type="submit"
              className="w-full py-4 rounded-lg text-sm font-semibold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/80 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Отправка...</>
              ) : (
                <><User size={16} /> Зарегистрироваться</>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-white/30">
          <Link to="/login" className="hover:text-white/60 transition-colors">
            Уже есть аккаунт? Войти
          </Link>
          <span>·</span>
          <Link to={isCrm ? "/login" : "/"} className="hover:text-white/60 transition-colors">
            На главную
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default RegisterPage;
