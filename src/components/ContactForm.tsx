import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";

const serviceTypes = [
  { id: "interior", label: "Установка межкомнатных дверей" },
  { id: "entrance", label: "Установка входных дверей" },
  { id: "repair", label: "Рекламация" },
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100, "Имя слишком длинное"),
  phone: z.string().trim().min(6, "Введите номер телефона").max(20, "Номер слишком длинный"),
  service: z.enum(["interior", "entrance", "repair"], { required_error: "Выберите услугу" }),
  message: z.string().trim().max(1000, "Сообщение слишком длинное").optional(),
});

type ContactData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<Partial<ContactData>>({ service: undefined });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ service: undefined });
    }, 1500);
  };

  return (
    <section
      id="contacts"
      className="relative py-24 md:py-32"
      style={{
        background: "linear-gradient(to bottom, hsl(50 14% 8%) 0%, hsl(60 8% 13%) 50%, hsl(70 7% 16%) 100%)",
      }}
    >
      <div
        ref={ref}
        className="relative z-10 px-8 md:px-16 lg:px-24 max-w-3xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <div className="mb-12 md:mb-16">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
            Связаться
          </p>
          <h2 className="font-display-stencil text-4xl md:text-5xl lg:text-6xl text-doorium-platinum leading-[0.95]">
            ОСТАВИТЬ ЗАЯВКУ
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service type selection */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-4">
              Тип услуги
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {serviceTypes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm({ ...form, service: s.id })}
                  className={`py-4 px-4 border text-sm font-body tracking-wide transition-all duration-300 text-left ${
                    form.service === s.id
                      ? "border-primary bg-primary/10 text-doorium-platinum"
                      : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.service && (
              <p className="text-destructive text-xs mt-2 font-body">{errors.service}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">
              Имя
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground"
              placeholder="Ваше имя"
              maxLength={100}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-2 font-body">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground"
              placeholder="+7 (___) ___-__-__"
              maxLength={20}
            />
            {errors.phone && (
              <p className="text-destructive text-xs mt-2 font-body">{errors.phone}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-primary mb-2">
              Сообщение <span className="text-muted-foreground">(необязательно)</span>
            </label>
            <textarea
              value={form.message || ""}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full bg-transparent border-b border-border/30 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-muted-foreground resize-none"
              placeholder="Дополнительная информация"
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase hover:bg-primary/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
