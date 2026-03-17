import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/api";
import { priceData, measurementData, formatPrice, type PriceItem } from "@/data/priceData";

type ServiceType = "interior" | "entrance";
type CityFilter = "moscow" | "spb";

const serviceFilters: { id: ServiceType; label: string }[] = [
  { id: "interior", label: "Установка межкомнатных дверей" },
  { id: "entrance", label: "Установка входных дверей" },
];

const cityFilters: { id: CityFilter; label: string }[] = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const requirementsData = [
  {
    title: "Подготовленное рабочее пространство",
    items: [
      "Помещение освобождено от мебели, коробок и строительных материалов.",
      "Зона монтажа хорошо освещена и свободна для работы.",
      "Температура не ниже +15°C.",
    ],
  },
  {
    title: "Материалы на объекте заранее",
    items: [
      "Все двери, коробки, доборы и фурнитура доставлены минимум за 24 часа до монтажа.",
      "Рекомендуется проверить комплектацию заранее.",
    ],
  },
  {
    title: "Проёмы подготовлены",
    items: [
      "Размеры и состояние проёмов соответствуют бланку замера.",
      "Удалены старые коробки, пена и остатки отделки.",
    ],
  },
  {
    title: "Объект готов к монтажу",
    items: [
      "Завершены отделочные работы: стены, пол, покрытия.",
      "Плинтуса не доходят до края проёма минимум на 100 мм.",
      "Влажность в помещении в норме.",
    ],
  },
  {
    title: "Нет параллельных работ",
    items: [
      "В зоне монтажа не должны работать другие специалисты.",
      "Доступ к проёмам свободен на всё время установки.",
    ],
  },
  {
    title: "Доступ и электропитание",
    items: [
      "Обеспечен доступ бригаде: пропуска, ключи, коды домофона.",
      "Рабочие розетки или удлинители достаточной длины.",
    ],
  },
];

/* ─── Animated wrapper ─── */
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s` }}>
      {children}
    </div>
  );
};

const contactSchema = z.object({
  name: z.string().trim().min(1, "Введите имя"),
  phone: z.string().trim().min(6, "Введите номер телефона"),
  service: z.enum(["interior", "entrance"]),
  message: z.string().optional(),
});

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") as ServiceType | null;
  const [activeType, setActiveType] = useState<ServiceType>(
    typeParam && ["interior", "entrance"].includes(typeParam) ? typeParam : "interior"
  );
  const [city, setCity] = useState<CityFilter>("moscow");

  const [form, setForm] = useState<{ name?: string; phone?: string; service: ServiceType; message?: string }>({ service: activeType });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleFilterChange = (type: ServiceType) => {
    setActiveType(type);
    setSearchParams({ type });
    setForm((f) => ({ ...f, service: type }));
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
      setErrors(fe);
      return;
    }
    setSending(true);
    try {
      await api("/api/requests/public", {
        method: "POST",
        body: {
          client_name: result.data.name,
          client_phone: result.data.phone,
          service_type: result.data.service,
          notes: result.data.message || "",
          source: "services_page",
        },
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ service: activeType });
    } catch {
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ service: activeType });
    } finally {
      setSending(false);
    }
  };

  const prices: PriceItem[] = priceData[activeType] || [];
  const measurement = measurementData[city];

  // Split price list into two columns for desktop
  const midpoint = Math.ceil(prices.length / 2);
  const leftPrices = prices.slice(0, midpoint);
  const rightPrices = prices.slice(midpoint);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-8 md:px-16 lg:px-24">
        <FadeIn>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Услуги и цены</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-doorium-platinum leading-[0.95] mb-4 tracking-wide">ПРАЙС-ЛИСТ</h1>
        </FadeIn>

        {/* City toggle */}
        <FadeIn delay={0.1} className="mt-8">
          <p className="font-body text-sm tracking-[0.15em] uppercase text-primary mb-4">Город</p>
          <div className="flex flex-wrap gap-3">
            {cityFilters.map((c) => (
              <button
                key={c.id}
                onClick={() => setCity(c.id)}
                className={`py-3 px-6 font-body text-sm tracking-wide uppercase transition-all duration-300 border ${
                  city === c.id
                    ? "border-primary bg-primary/10 text-doorium-platinum"
                    : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Service toggle */}
        <FadeIn delay={0.15} className="mt-8">
          <p className="font-body text-sm tracking-[0.15em] uppercase text-primary mb-4">Выберите услугу</p>
          <div className="flex flex-wrap gap-3">
            {serviceFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id)}
                className={`py-3 px-6 font-body text-sm tracking-wide uppercase transition-all duration-300 border ${
                  activeType === f.id
                    ? "border-primary bg-primary/10 text-doorium-platinum"
                    : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Measurement */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <FadeIn>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-8">Стоимость замера</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-light text-doorium-platinum mb-6 tracking-wide">{measurement.main.title}</h3>
              {measurement.main.items.map((row, i) => (
                row.label ? (
                  <div key={i} className="flex justify-between items-baseline py-4 border-b border-border/20">
                    <span className="font-body text-sm text-doorium-platinum/80">{row.label}</span>
                    <span className="font-body text-sm text-doorium-platinum ml-4 whitespace-nowrap">{row.value}</span>
                  </div>
                ) : (
                  <p key={i} className="font-body text-xs text-muted-foreground mt-3">{row.value}</p>
                )
              ))}
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-light text-doorium-platinum mb-6 tracking-wide">{measurement.extra.title}</h3>
              {measurement.extra.items.map((row, i) => (
                <div key={i} className="flex justify-between items-baseline py-4 border-b border-border/20">
                  <span className="font-body text-sm text-doorium-platinum/80">{row.label}</span>
                  <span className="font-body text-sm text-doorium-platinum ml-4 whitespace-nowrap">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Price table — two-column layout like PrimeDoor */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left column */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/30">
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pr-2">Наименование</th>
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 px-2 w-12 hidden md:table-cell">Ед.</th>
                    <th className="text-right font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pl-2 w-28">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {leftPrices.map((row, i) => (
                    <tr key={i} className="border-b border-border/15 hover:bg-primary/5 transition-colors duration-200">
                      <td className="font-body text-sm text-doorium-platinum/80 py-4 pr-2 break-words">{row.name}</td>
                      <td className="font-body text-sm text-muted-foreground py-4 px-2 hidden md:table-cell">{row.unit}</td>
                      <td className="font-body text-sm text-doorium-platinum py-4 pl-2 text-right whitespace-nowrap">{formatPrice(city === "moscow" ? row.moscow : row.spb)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Right column */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/30">
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pr-2">Наименование</th>
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 px-2 w-12 hidden md:table-cell">Ед.</th>
                    <th className="text-right font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pl-2 w-28">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {rightPrices.map((row, i) => (
                    <tr key={i} className="border-b border-border/15 hover:bg-primary/5 transition-colors duration-200">
                      <td className="font-body text-sm text-doorium-platinum/80 py-4 pr-2 break-words">{row.name}</td>
                      <td className="font-body text-sm text-muted-foreground py-4 px-2 hidden md:table-cell">{row.unit}</td>
                      <td className="font-body text-sm text-doorium-platinum py-4 pl-2 text-right whitespace-nowrap">{formatPrice(city === "moscow" ? row.moscow : row.spb)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-6 italic">* Указаны ориентировочные цены. Точная стоимость определяется после осмотра объекта.</p>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-16 lg:px-24 pb-24">
        <FadeIn>
          <a href="#services-contact" className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300 rounded-sm">
            Оставить заявку
          </a>
        </FadeIn>
      </section>

      {/* Requirements */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24" style={{ background: "hsl(50 14% 5%)" }}>
        <FadeIn>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Подготовка к монтажу</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-doorium-platinum leading-[0.95] mb-16 tracking-wide">ТРЕБОВАНИЯ К ОБЪЕКТУ</h2>
        </FadeIn>
        <p className="font-body text-sm text-doorium-platinum/70 max-w-2xl mb-12 leading-relaxed">
          Чтобы установка дверей прошла в назначенный день без задержек и дополнительных расходов, объект должен быть полностью подготовлен.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {requirementsData.map((req, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="border-l-2 border-primary/40 pl-6">
                <h3 className="font-display text-lg font-light text-doorium-platinum mb-4 tracking-wide">{req.title}</h3>
                <ul className="space-y-2">
                  {req.items.map((item, j) => (
                    <li key={j} className="font-body text-sm text-doorium-platinum/60 leading-relaxed flex gap-2">
                      <span className="text-primary mt-1 shrink-0">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section id="services-contact" className="py-24 md:py-32 px-8 md:px-16 lg:px-24" style={{ background: "hsl(50 14% 5%)" }}>
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Связаться</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-doorium-platinum leading-[0.95] mb-12 tracking-wide">ОСТАВИТЬ ЗАЯВКУ</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-4">Тип услуги</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serviceFilters.map((s) => (
                    <button key={s.id} type="button" onClick={() => setForm({ ...form, service: s.id })}
                      className={`py-4 px-4 border text-sm font-body tracking-wide transition-all duration-300 text-left ${form.service === s.id ? "border-primary bg-primary/10 text-doorium-platinum" : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.service && <p className="text-destructive text-xs mt-2 font-body">{errors.service}</p>}
              </div>
              <div>
                <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">Имя</label>
                <input type="text" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground" placeholder="Ваше имя" />
                {errors.name && <p className="text-destructive text-xs mt-2 font-body">{errors.name}</p>}
              </div>
              <div>
                <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">Телефон</label>
                <input type="tel" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground" placeholder="+7 (___) ___-__-__" />
                {errors.phone && <p className="text-destructive text-xs mt-2 font-body">{errors.phone}</p>}
              </div>
              <div>
                <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">Сообщение <span className="text-muted-foreground">(необязательно)</span></label>
                <textarea value={form.message || ""} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3}
                  className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground resize-none" placeholder="Дополнительная информация" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase hover:bg-primary/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
              </button>
            </form>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
