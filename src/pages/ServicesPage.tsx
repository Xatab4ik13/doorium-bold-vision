import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { z } from "zod";

type ServiceType = "interior" | "entrance" | "repair";

const serviceFilters: { id: ServiceType; label: string }[] = [
  { id: "interior", label: "Установка межкомнатных дверей" },
  { id: "entrance", label: "Установка входных дверей" },
  { id: "repair", label: "Рекламация" },
];

interface PriceRow { name: string; unit: string; price: string; }
interface PriceSection { title: string; rows: PriceRow[]; note?: string; }

const measurementData: Record<ServiceType, { main: { title: string; rows: { name: string; price: string }[] }; extra?: { title: string; rows: { name: string; price: string }[] } }> = {
  interior: {
    main: {
      title: "Замер дверей (Москва)",
      rows: [
        { name: "До 10 дверей", price: "2 000 ₽" },
        { name: "Каждый последующий бланк", price: "+500 ₽" },
        { name: "Выезд за МКАД", price: "50 ₽ за каждый км" },
      ],
    },
  },
  entrance: {
    main: {
      title: "Замер дверей (Москва)",
      rows: [
        { name: "До 10 дверей", price: "2 000 ₽" },
        { name: "Каждый последующий бланк", price: "+500 ₽" },
        { name: "Выезд за МКАД", price: "50 ₽ за каждый км" },
      ],
    },
    extra: {
      title: "Дополнительные замеры",
      rows: [
        { name: "Панель на входную дверь (без разбора)", price: "2 000 ₽" },
        { name: "Плинтуса (до 100 пог. м)", price: "2 000 ₽" },
        { name: "Стеновые панели", price: "Индивидуальный просчёт" },
      ],
    },
  },
  repair: {
    main: {
      title: "Выезд мастера (Москва)",
      rows: [
        { name: "Диагностика / осмотр", price: "2 500 ₽" },
        { name: "Выезд за МКАД", price: "50 ₽ за каждый км" },
      ],
    },
  },
};

const priceData: Record<ServiceType, PriceSection[]> = {
  interior: [
    {
      title: "Монтаж межкомнатных дверей",
      rows: [
        { name: "Доставка дверей по Москве + подъём на грузовом лифте", unit: "шт", price: "1 500 ₽" },
        { name: "Выезд за МКАД", unit: "км", price: "50 ₽" },
        { name: "Подъём без лифта (за этаж)", unit: "этаж", price: "200 ₽" },
        { name: "Установка двери распашной в готовый проём", unit: "шт", price: "5 500 ₽" },
        { name: "Установка двери-купе (одностворчатая)", unit: "шт", price: "6 500 ₽" },
        { name: "Установка двери-книжки / двери-гармошки", unit: "шт", price: "7 500 ₽" },
        { name: "Установка скрытой двери (алюминиевый короб)", unit: "шт", price: "9 000 ₽" },
        { name: "Установка двустворчатой двери", unit: "шт", price: "8 500 ₽" },
        { name: "Демонтаж старой двери", unit: "шт", price: "750 ₽" },
        { name: "Расширение проёма (одна сторона)", unit: "шт", price: "от 1 000 ₽" },
        { name: "Сужение проёма (пеноблок, одна сторона)", unit: "шт", price: "5 000 ₽" },
      ],
    },
    {
      title: "Дополнительные работы",
      rows: [
        { name: "Установка доборов (до 300 мм)", unit: "шт", price: "1 500 ₽" },
        { name: "Установка наличников (комплект)", unit: "комп", price: "500 ₽" },
        { name: "Врезка замка / защёлки", unit: "шт", price: "1 500 ₽" },
        { name: "Врезка петель (скрытых)", unit: "шт", price: "2 000 ₽" },
        { name: "Подрезка полотна по высоте", unit: "шт", price: "1 500 ₽" },
        { name: "Установка плинтусов (погонный метр)", unit: "п.м.", price: "350 ₽" },
        { name: "Расходные материалы (1 комплект)", unit: "комп", price: "800 ₽" },
        { name: "Повторный выезд по просьбе заказчика", unit: "выезд", price: "2 500 ₽" },
      ],
      note: "* Указаны ориентировочные цены. Точная стоимость определяется после осмотра объекта.",
    },
  ],
  entrance: [
    {
      title: "Монтаж входных дверей",
      rows: [
        { name: "Доставка двери по Москве + подъём на грузовом лифте", unit: "шт", price: "2 500 ₽" },
        { name: "Выезд за МКАД", unit: "км", price: "50 ₽" },
        { name: "Подъём двери без лифта (за этаж)", unit: "этаж", price: "500 ₽" },
        { name: "Установка стандартной двери в готовый проём", unit: "шт", price: "5 500 ₽" },
        { name: "Установка стандартной двери (дверь на месте)", unit: "шт", price: "7 500 ₽" },
        { name: "Установка двери с биометрическим замком", unit: "шт", price: "9 500 ₽" },
        { name: "Установка полуторостворчатой двери (до 1400×2050)", unit: "шт", price: "9 500 ₽" },
        { name: "Установка двери Термо с тёплым монтажом", unit: "шт", price: "10 000 ₽" },
        { name: "Установка полуторостворчатой двери Термо", unit: "шт", price: "15 000 ₽" },
        { name: "Демонтаж деревянной двери / с фрамугой", unit: "шт", price: "750 / 1 200 ₽" },
        { name: "Демонтаж металлической двери / с фрамугой", unit: "шт", price: "1 000 / 1 700 ₽" },
        { name: "Расширение проёма (одна сторона)", unit: "шт", price: "от 1 000 ₽" },
        { name: "Сужение проёма (столбик из пеноблока)", unit: "шт", price: "5 000 ₽" },
        { name: "Кладка пеноблоком (верх до 20 см) вкл. материал", unit: "шт", price: "3 000 ₽" },
        { name: "Кладка пеноблоком (верх свыше 20 см) вкл. материал", unit: "шт", price: "5 000 ₽" },
      ],
    },
    {
      title: "Дополнительные работы",
      rows: [
        { name: "Установка доп. креплений-ушей", unit: "шт", price: "300 ₽" },
        { name: "Установка доборов (до 300 мм) на входную дверь", unit: "шт", price: "5 500 ₽" },
        { name: "Замена панели (внутренней / внешней / 2-х)", unit: "шт", price: "6 500 / 9 000 / 10 000 ₽" },
        { name: "Подрезка панели (без обкатки)", unit: "шт", price: "1 500 ₽" },
        { name: "Роспуск наличника (металл / дерево)", unit: "шт", price: "1 000 / 750 ₽" },
        { name: "Упаковка двери / утилизация старой двери", unit: "шт", price: "1 000 / 2 000 ₽" },
        { name: "Замена замка (без снятия / со снятием панели)", unit: "шт", price: "2 500 / 6 500 ₽" },
        { name: "Замена цилиндра / врезка глазка / доводчик", unit: "шт", price: "2 000 ₽" },
        { name: "Усиление проёма (линейное / уголками)", unit: "шт", price: "6 000 / 7 500 ₽" },
        { name: "Расходные материалы (1 комплект)", unit: "комп", price: "1 000 ₽" },
        { name: "Нестандартные размеры дверей / доборов", unit: "—", price: "+30%" },
        { name: "Повторный выезд по просьбе заказчика", unit: "выезд", price: "2 500 ₽" },
      ],
      note: "* Указаны ориентировочные цены. Точная стоимость определяется после осмотра объекта.",
    },
  ],
  repair: [
    {
      title: "Рекламационные работы",
      rows: [
        { name: "Регулировка двери (петли, замки, геометрия)", unit: "шт", price: "2 500 ₽" },
        { name: "Замена уплотнителя (комплект)", unit: "комп", price: "1 500 ₽" },
        { name: "Замена замка / ручки / фурнитуры", unit: "шт", price: "от 2 000 ₽" },
        { name: "Устранение скрипа / провисания петель", unit: "шт", price: "1 500 ₽" },
        { name: "Восстановление геометрии короба", unit: "шт", price: "от 3 500 ₽" },
        { name: "Замена доборов / наличников", unit: "шт", price: "от 2 000 ₽" },
        { name: "Повторный выезд по просьбе заказчика", unit: "выезд", price: "2 500 ₽" },
      ],
      note: "* Точная стоимость определяется после осмотра. Работаем с дверями любых производителей.",
    },
  ],
};

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
  service: z.enum(["interior", "entrance", "repair"]),
  message: z.string().optional(),
});

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") as ServiceType | null;
  const [activeType, setActiveType] = useState<ServiceType>(
    typeParam && ["interior", "entrance", "repair"].includes(typeParam) ? typeParam : "interior"
  );

  const [form, setForm] = useState<{ name?: string; phone?: string; service: ServiceType; message?: string }>({ service: activeType });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleFilterChange = (type: ServiceType) => {
    setActiveType(type);
    setSearchParams({ type });
    setForm((f) => ({ ...f, service: type }));
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setSending(false);
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ service: activeType });
    }, 1500);
  };

  const measurement = measurementData[activeType];
  const prices = priceData[activeType];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "hsl(50 14% 8%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-8 md:px-16 lg:px-24">
        <FadeIn>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Услуги и цены</p>
          <h1 className="font-display-stencil text-5xl md:text-6xl lg:text-7xl text-doorium-platinum leading-[0.95] mb-4">ПРАЙС-ЛИСТ</h1>
          <p className="font-body text-base text-muted-foreground max-w-md">Работаем только в Москве и Московской области</p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-12">
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
              <h3 className="font-display-stencil text-xl md:text-2xl text-doorium-platinum mb-6">{measurement.main.title}</h3>
              {measurement.main.rows.map((row, i) => (
                <div key={i} className="flex justify-between items-baseline py-4 border-b border-border/20">
                  <span className="font-body text-sm text-doorium-platinum/80">{row.name}</span>
                  <span className="font-body text-sm text-doorium-platinum ml-4 whitespace-nowrap">{row.price}</span>
                </div>
              ))}
              <p className="font-body text-xs text-muted-foreground mt-3">Расчёт производится в одну сторону</p>
            </div>
            {measurement.extra && (
              <div>
                <h3 className="font-display-stencil text-xl md:text-2xl text-doorium-platinum mb-6">{measurement.extra.title}</h3>
                {measurement.extra.rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-baseline py-4 border-b border-border/20">
                    <span className="font-body text-sm text-doorium-platinum/80">{row.name}</span>
                    <span className="font-body text-sm text-doorium-platinum ml-4 whitespace-nowrap">{row.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* Price tables */}
      {prices.map((section, sIdx) => (
        <section key={`${activeType}-${sIdx}`} className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
          <FadeIn delay={sIdx * 0.1}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/30">
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pr-4">{section.title}</th>
                    <th className="text-left font-body text-xs tracking-[0.2em] uppercase text-primary py-4 px-4 w-16">Ед.</th>
                    <th className="text-right font-body text-xs tracking-[0.2em] uppercase text-primary py-4 pl-4 w-40">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/15 hover:bg-primary/5 transition-colors duration-200">
                      <td className="font-body text-sm text-doorium-platinum/80 py-4 pr-4">{row.name}</td>
                      <td className="font-body text-sm text-muted-foreground py-4 px-4">{row.unit}</td>
                      <td className="font-body text-sm text-doorium-platinum py-4 pl-4 text-right whitespace-nowrap">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {section.note && <p className="font-body text-xs text-muted-foreground mt-4 italic">{section.note}</p>}
          </FadeIn>
        </section>
      ))}

      {/* CTA */}
      <section className="px-8 md:px-16 lg:px-24 pb-24">
        <FadeIn>
          <a href="#services-contact" className="inline-block font-display-stencil text-sm tracking-[0.2em] uppercase px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300">
            Оставить заявку
          </a>
        </FadeIn>
      </section>

      {/* Requirements */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24" style={{ background: "linear-gradient(to bottom, hsl(50 14% 8%) 0%, hsl(60 8% 13%) 50%, hsl(70 7% 16%) 100%)" }}>
        <FadeIn>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Подготовка к монтажу</p>
          <h2 className="font-display-stencil text-3xl md:text-4xl lg:text-5xl text-doorium-platinum leading-[0.95] mb-16">ТРЕБОВАНИЯ К ОБЪЕКТУ</h2>
        </FadeIn>
        <p className="font-body text-sm text-doorium-platinum/70 max-w-2xl mb-12 leading-relaxed">
          Чтобы установка дверей прошла в назначенный день без задержек и дополнительных расходов, объект должен быть полностью подготовлен.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {requirementsData.map((req, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="border-l-2 border-primary/40 pl-6">
                <h3 className="font-display-stencil text-lg text-doorium-platinum mb-4">{req.title}</h3>
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
      <section id="services-contact" className="py-24 md:py-32 px-8 md:px-16 lg:px-24" style={{ background: "hsl(70 7% 16%)" }}>
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Связаться</p>
            <h2 className="font-display-stencil text-4xl md:text-5xl text-doorium-platinum leading-[0.95] mb-12">ОСТАВИТЬ ЗАЯВКУ</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-4">Тип услуги</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
