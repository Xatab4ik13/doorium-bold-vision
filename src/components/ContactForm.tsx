import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";
import AddressInput from "@/components/AddressInput";

const cities = ["Москва", "Санкт-Петербург"] as const;

const requestTypes = [
  { id: "measurement", label: "Заявка на замер" },
  { id: "installation", label: "Заявка на монтаж" },
  { id: "reclamation", label: "Рекламация" },
] as const;

const contactSchema = z.object({
  city: z.string().min(1, "Выберите город"),
  requestType: z.string().min(1, "Выберите тип заявки"),
  name: z.string().trim().min(1, "Введите ФИО").max(100),
  phone: z.string().trim().min(6, "Введите номер телефона").max(20),
  extraName: z.string().trim().max(100).optional(),
  extraPhone: z.string().trim().max(20).optional(),
  address: z.string().trim().min(1, "Введите адрес").max(200),
  details: z.string().trim().max(1000).optional(),
});

type ContactData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<Partial<ContactData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const update = (key: keyof ContactData, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      await api("/api/requests/public", {
        method: "POST",
        body: {
          client_name: result.data.name,
          client_phone: result.data.phone,
          client_address: result.data.address || "",
          city: result.data.city,
          type: result.data.requestType,
          work_description: result.data.details || "",
          extra_name: result.data.extraName || "",
          extra_phone: result.data.extraPhone || "",
          source: "site",
        },
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({});
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки заявки");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full bg-doorium-smoky/50 border border-border/20 rounded-lg px-4 py-3 text-doorium-platinum font-body text-sm focus:outline-none focus:border-primary/50 transition-colors duration-300 placeholder:text-muted-foreground";

  return (
    <section
      id="contacts"
      className="relative py-20 md:py-28"
      style={{ background: "hsl(50 14% 5%)" }}
    >
      <div
        ref={ref}
        className="relative z-10 px-6 md:px-16 lg:px-24 max-w-4xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <div className="mb-10 md:mb-14">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
            Связаться
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum leading-[0.95] tracking-wide">
            ОСТАВИТЬ ЗАЯВКУ
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* City selector */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-doorium-platinum/60 mb-4">
              Выберите город
            </label>
            <div className="flex flex-wrap gap-3">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => update("city", city)}
                  className={`px-6 py-3 border rounded-sm font-body text-sm tracking-wide uppercase transition-all duration-300 ${
                    form.city === city
                      ? "border-primary bg-primary/10 text-doorium-platinum"
                      : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            {errors.city && <p className="text-destructive text-xs mt-2 font-body">{errors.city}</p>}
          </div>

          {/* Request type */}
          <div>
            <label className="block font-body text-sm tracking-[0.15em] uppercase text-doorium-platinum/60 mb-4">
              Тип заявки
            </label>
            <div className="flex flex-wrap gap-3">
              {requestTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update("requestType", t.id)}
                  className={`px-6 py-3 border rounded-sm font-body text-sm tracking-wide uppercase transition-all duration-300 ${
                    form.requestType === t.id
                      ? "border-primary bg-primary/10 text-doorium-platinum"
                      : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-doorium-platinum"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.requestType && <p className="text-destructive text-xs mt-2 font-body">{errors.requestType}</p>}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input type="text" value={form.name || ""} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="ФИО" maxLength={100} />
              <input type="tel" value={form.phone || ""} onChange={(e) => update("phone", formatPhone(e.target.value))} className={`${inputClass} mt-3`} placeholder="+7" maxLength={20} />
              {errors.name && <p className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
              {errors.phone && <p className="text-destructive text-xs mt-1 font-body">{errors.phone}</p>}
            </div>
            <div>
              <input type="text" value={form.extraName || ""} onChange={(e) => update("extraName", e.target.value)} className={inputClass} placeholder="ФИО доп. контакта" maxLength={100} />
              <input type="tel" value={form.extraPhone || ""} onChange={(e) => update("extraPhone", formatPhone(e.target.value))} className={`${inputClass} mt-3`} placeholder="+7" maxLength={20} />
            </div>
            <div>
              <AddressInput
                value={form.address || ""}
                onChange={(val) => update("address", val)}
                city={form.city}
                placeholder="Адрес"
                className={inputClass}
                error={errors.address}
              />
            </div>
          </div>

          <div>
            <textarea value={form.details || ""} onChange={(e) => update("details", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Что замеряем" maxLength={1000} />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-body text-sm font-medium tracking-[0.15em] uppercase hover:bg-primary/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
          </button>
        </form>
      </div>

      {/* Floating phone button */}
      <a
        href="tel:+79168191996"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground hover:bg-primary transition-colors duration-300 shadow-lg"
        aria-label="Позвонить"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </a>
    </section>
  );
};

export default ContactForm;
