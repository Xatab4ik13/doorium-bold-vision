import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { z } from "zod";
import {
  Shield,
  FileText,
  HeadphonesIcon,
  MonitorSmartphone,
  Handshake,
  Store,
  Palette,
  Building2,
  HardHat,
  CheckCircle2,
  Send,
} from "lucide-react";
import logo from "@/assets/doorium-logo-new.png";
import api from "@/lib/api";

const partnerSchema = z.object({
  name: z.string().trim().min(1, "Введите ФИО").max(100),
  store_name: z.string().trim().min(1, "Введите название компании").max(100),
  store_address: z.string().trim().min(1, "Введите адрес").max(200),
  phone: z.string().trim().min(6, "Введите номер телефона").max(20),
  email: z.string().trim().email("Введите корректный email").max(255),
});

const offerings = [
  { icon: Shield, title: "СТАБИЛЬНЫЙ СЕРВИС", items: ["Качественный монтаж любой сложности", "Работа строго по замеру и ТЗ", "Постмонтажная чистота на объекте"] },
  { icon: FileText, title: "ПОНЯТНЫЕ УСЛОВИЯ", items: ["Прозрачный понятный прайс на все виды работ", "Составление и согласование сметы перед монтажом", "Работа «в белую», полный комплект документов"] },
  { icon: HeadphonesIcon, title: "ПОДДЕРЖКА ПАРТНЁРОВ", items: ["Персональный менеджер", "Оперативная связь", "Приоритетное бронирование дат монтажа", "Консультация по всем техническим вопросам"] },
  { icon: Handshake, title: "ГАРАНТИЯ", items: ["Гарантия на монтаж 12 месяцев", "Оперативный выезд и бесплатная регулировка", "100% закрытие рекламационных случаев"] },
  { icon: MonitorSmartphone, title: "УДОБНАЯ CRM-СИСТЕМА", items: ["Удобное направление заявок", "Отслеживание статуса и сроков", "Полный отчёт о проделанной работе"] },
];

const formats = [
  { icon: Store, title: "Салоны и интернет-магазины дверей", desc: "Работаем как аутсорс-монтаж под Вашим брендом" },
  { icon: Palette, title: "Дизайнеры и архитекторы", desc: "Монтаж по дизайн-проекту с вниманием к деталям" },
  { icon: Building2, title: "Строительные компании и застройщики", desc: "Качественный сервис большого объёма" },
  { icon: HardHat, title: "Прорабы и строительные бригады", desc: "Гибкий график бригад под сроки объекта" },
];

const partnerBenefits = [
  "Персональную сервисную службу",
  "Фиксированные расценки",
  "Понятные сроки",
  "Оперативную техническую поддержку",
  "Гарантию на монтаж",
  "Рекомендации от клиентов",
];

const useFadeIn = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, style: {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(40px)",
    transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
  }};
};

const PartnerPage = () => {
  const hero = useFadeIn(0.15);
  const offerRef = useFadeIn(0.15);
  const formatRef = useFadeIn(0.15);
  const benefitRef = useFadeIn(0.15);
  const formRef = useFadeIn(0.15);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Стать партнёром — Doorium Service | Партнёрская программа";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = partnerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSending(true);
    try {
      await api("/api/partner-form", {
        method: "POST",
        body: result.data,
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({});
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const inputClass =
    "w-full bg-doorium-smoky/50 border border-border/20 rounded-lg px-4 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary/50 transition-colors duration-300 placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero — clean, with logo */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-24 px-8 md:px-16 lg:px-24">
        <div ref={hero.ref} style={hero.style} className="max-w-5xl mx-auto text-center">
          <img src={logo} alt="Doorium" className="h-28 md:h-36 w-auto mx-auto mb-6 brightness-0 invert opacity-70" />
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-4">Doorium Service</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-doorium-platinum leading-[0.95] mb-6 tracking-wide">
            СТАТЬ ПАРТНЁРОМ
          </h1>
          <blockquote className="font-display text-lg md:text-xl text-doorium-platinum/50 italic max-w-2xl mx-auto mb-4">
            «Великое в бизнесе делает не один человек, а Команда»
          </blockquote>
          <p className="font-body text-sm text-primary">— Стив Джобс</p>
          <div className="w-16 h-[2px] bg-primary mt-8 mx-auto" />
        </div>
      </section>

      {/* About */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-base md:text-lg text-doorium-platinum/60 leading-relaxed">
            Более 15 лет команда Doorium Service оказывает высококачественные и профессиональные услуги
            по установке всех видов дверей и раздвижных систем в Москве и Московской области.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
            <div className="border border-border/20 rounded-lg p-6">
              <h3 className="font-display text-lg text-primary mb-2 tracking-wide">Наша цель</h3>
              <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed">
                Предоставление качественного сервиса, усиливающего репутацию Партнёра.
              </p>
            </div>
            <div className="border border-border/20 rounded-lg p-6">
              <h3 className="font-display text-lg text-primary mb-2 tracking-wide">Наше кредо</h3>
              <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed">
                Долгосрочные отношения, основанные на доверии.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we offer — matching screenshot layout */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <div ref={offerRef.ref} style={offerRef.style} className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum mb-10 tracking-wide text-center">
            ЧТО МЫ ПРЕДЛАГАЕМ ПАРТНЁРАМ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offerings.slice(0, 3).map((o, i) => (
              <div key={i} className="border border-border/20 rounded-lg p-6 hover:border-primary/30 transition-colors duration-500">
                <o.icon className="w-7 h-7 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-base text-doorium-platinum mb-3 tracking-wide uppercase">{o.title}</h3>
                <ul className="space-y-1.5">
                  {o.items.map((item, j) => (
                    <li key={j} className="font-body text-sm text-doorium-platinum/50 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {offerings.slice(3).map((o, i) => (
              <div key={i} className="border border-border/20 rounded-lg p-6 hover:border-primary/30 transition-colors duration-500">
                <o.icon className="w-7 h-7 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-base text-doorium-platinum mb-3 tracking-wide uppercase">{o.title}</h3>
                <ul className="space-y-1.5">
                  {o.items.map((item, j) => (
                    <li key={j} className="font-body text-sm text-doorium-platinum/50 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <div ref={formatRef.ref} style={formatRef.style} className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum mb-10 tracking-wide text-center">
            ФОРМАТЫ СОТРУДНИЧЕСТВА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formats.map((f, i) => (
              <div key={i} className="border border-border/20 rounded-lg p-6 flex items-start gap-4 hover:border-primary/30 transition-colors duration-500">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-lg text-doorium-platinum mb-1 tracking-wide">{f.title}</h3>
                  <p className="font-body text-sm text-doorium-platinum/50 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <div ref={benefitRef.ref} style={benefitRef.style} className="max-w-4xl mx-auto">
          <div
            className="rounded-xl p-8 md:p-12"
            style={{
              background: "linear-gradient(135deg, hsl(50 14% 12%) 0%, hsl(50 14% 8%) 100%)",
              boxShadow: "0 20px 50px -15px rgba(0,0,0,0.4)",
            }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-light text-doorium-platinum mb-8 tracking-wide text-center">
              Став нашим партнёром, вы получаете:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {partnerBenefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span className="font-body text-sm text-doorium-platinum/70">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div ref={formRef.ref} style={formRef.style} className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum mb-10 tracking-wide text-center">
            ОСТАВИТЬ ЗАЯВКУ ПАРТНЁРА
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" placeholder="ФИО" value={form.name || ""} onChange={(e) => update("name", e.target.value)} className={inputClass} maxLength={100} />
              {errors.name && <p className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
            </div>
            <div>
              <input type="text" placeholder="Название компании / магазина" value={form.store_name || ""} onChange={(e) => update("store_name", e.target.value)} className={inputClass} maxLength={100} />
              {errors.store_name && <p className="text-destructive text-xs mt-1 font-body">{errors.store_name}</p>}
            </div>
            <div>
              <input type="text" placeholder="Адрес магазина / офиса" value={form.store_address || ""} onChange={(e) => update("store_address", e.target.value)} className={inputClass} maxLength={200} />
              {errors.store_address && <p className="text-destructive text-xs mt-1 font-body">{errors.store_address}</p>}
            </div>
            <div>
              <input type="tel" placeholder="+7" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} maxLength={20} />
              {errors.phone && <p className="text-destructive text-xs mt-1 font-body">{errors.phone}</p>}
            </div>
            <div>
              <input type="email" placeholder="Электронная почта" value={form.email || ""} onChange={(e) => update("email", e.target.value)} className={inputClass} maxLength={255} />
              {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-body text-sm font-medium tracking-[0.15em] uppercase hover:bg-primary/80 transition-colors duration-300 disabled:opacity-50 rounded-sm flex items-center justify-center gap-2 mx-auto"
              >
                <Send size={14} />
                {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ ЗАЯВКУ"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerPage;
