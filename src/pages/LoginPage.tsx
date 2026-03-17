import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Lock, Loader2, Phone, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { formatPhone } from "@/lib/formatPhone";
import logoImg from "@/assets/doorium-logo-new.png";

type LoginMode = "pin" | "admin";
type PinStep = "phone" | "code";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  measurer: "/measurer",
  installer: "/installer",
  partner: "/partner",
};

const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>("pin");
  const [step, setStep] = useState<PinStep>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLogging, setAutoLogging] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Вход в кабинет — Doorium Service";
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRoutes[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-login with device token
  useEffect(() => {
    const deviceToken = localStorage.getItem("crm_device_token");
    const savedPhone = localStorage.getItem("crm_device_phone");
    if (deviceToken && savedPhone) {
      setAutoLogging(true);
      api("/api/auth/pin", {
        method: "POST",
        body: { phone: savedPhone, device_token: deviceToken },
      })
        .then((data: any) => {
          if (data.device_token) localStorage.setItem("crm_device_token", data.device_token);
          login(data.token, data.user);
          toast.success(`С возвращением, ${data.user.name}!`);
          navigate(roleRoutes[data.user.role] || "/", { replace: true });
        })
        .catch(() => {
          localStorage.removeItem("crm_device_token");
          localStorage.removeItem("crm_device_phone");
          setAutoLogging(false);
        });
    }
  }, []);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStep("code");
    setPin("");
  };

  const handlePinComplete = useCallback(async (value: string) => {
    if (value.length !== 4) return;
    setLoading(true);
    try {
      const data = await api("/api/auth/pin", {
        method: "POST",
        body: { phone, pin: value },
      });
      if (data.device_token) {
        localStorage.setItem("crm_device_token", data.device_token);
        localStorage.setItem("crm_device_phone", phone);
      }
      login(data.token, data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      navigate(roleRoutes[data.user.role] || "/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации");
      setPin("");
    } finally {
      setLoading(false);
    }
  }, [phone, login, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/auth/admin", {
        method: "POST",
        body: { email, password },
      });
      login(data.token, data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-slate-300 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors duration-500";

  if (autoLogging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Выполняется вход...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src={logoImg} alt="Doorium Service" className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Вход в кабинет</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => { setMode("pin"); setStep("phone"); setPin(""); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "pin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Phone className="w-4 h-4" />
            По телефону
          </button>
          <button
            onClick={() => { setMode("admin"); setStep("phone"); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "admin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Shield className="w-4 h-4" />
            Администратор
          </button>
        </div>

        {mode === "pin" ? (
          <div>
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <p className="text-sm text-slate-500">
                  Введите номер телефона, указанный при регистрации
                </p>
                <input
                  type="tel"
                  placeholder="+7 ___ ___ __ __"
                  value={phone}
                  onFocus={(e) => { if (!e.target.value) setPhone("+7"); }}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={inputClass}
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Продолжить
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => { setStep("phone"); setPin(""); }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Изменить номер
                </button>
                <p className="text-sm text-slate-500">
                  Введите ПИН-код для {phone}
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(value) => {
                      setPin(value);
                      if (value.length === 4) handlePinComplete(value);
                    }}
                    autoFocus
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {loading && (
                  <div className="flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <p className="text-sm text-slate-500">
              Вход по email и паролю — только для администраторов
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Вход...
                </span>
              ) : "Войти"}
            </button>
          </form>
        )}

        {/* Back to site */}
        <div className="text-center">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
