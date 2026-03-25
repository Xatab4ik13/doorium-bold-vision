import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { Phone, Mail } from "lucide-react";
import logo from "@/assets/doorium-logo-new.png";

const contactInfo = [
  {
    icon: Phone,
    title: "ТЕЛЕФОН",
    lines: [
      { label: "Москва", value: "8 (916) 819-19-96", href: "tel:+79168191996" },
      { label: "Санкт-Петербург", value: "+7 (926) 863-70-08", href: "tel:+79268637008" },
    ],
  },
  {
    icon: Mail,
    title: "ПОЧТА",
    lines: [
      { label: "", value: "info@doorium.ru", href: "mailto:info@doorium.ru" },
    ],
  },
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

const ContactsPage = () => {
  const hero = useFadeIn(0.15);
  const cards = useFadeIn(0.2);

  useEffect(() => {
    document.title = "Контакты — Doorium Service | Установка дверей в Москве и СПб";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero with logo */}
      <section className="pt-40 pb-12 md:pt-48 md:pb-16 px-8 md:px-16 lg:px-24">
        <div ref={hero.ref} style={hero.style} className="max-w-5xl mx-auto text-center">
          <img src={logo} alt="Doorium" className="h-28 md:h-36 w-auto mx-auto mb-6 brightness-0 invert opacity-70" />
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
            Doorium Service
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-doorium-platinum leading-[0.9] mb-6 tracking-wide">
            КОНТАКТЫ
          </h1>
          <div className="w-16 h-[2px] bg-primary mx-auto" />
        </div>
      </section>

      {/* Contact cards + social */}
      <section className="px-8 md:px-16 lg:px-24 pb-12 md:pb-16">
        <div
          ref={cards.ref}
          style={cards.style}
          className="max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {contactInfo.map((item, i) => (
              <div
                key={item.title}
                className="border border-border/20 rounded-lg p-8 group hover:border-primary/40 transition-colors duration-500"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <item.icon className="w-6 h-6 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-4">
                  {item.title}
                </h3>
                {item.lines.map((line) => (
                  <div key={line.value} className="mb-1.5">
                    {line.label && (
                      <p className="font-body text-[10px] tracking-wider text-doorium-platinum/30">{line.label}</p>
                    )}
                    <a href={line.href} className="font-body text-lg font-bold text-doorium-platinum/80 leading-relaxed hover:text-primary transition-colors" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
                      {line.value}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://t.me/Doorium_service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 border border-border/20 rounded-lg text-doorium-platinum/60 hover:border-primary/40 hover:text-primary transition-colors font-body text-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
            <a
              href="https://max.ru/u/f9LHodD0cOJMEjKWRIkz2LvqUetirYd-JBWylARJJOTxfauqq9Q_PPRR9-4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 border border-border/20 rounded-lg text-doorium-platinum/60 hover:border-primary/40 hover:text-primary transition-colors font-body text-sm"
            >
              <span className="w-5 h-5 rounded-full bg-doorium-platinum/20 flex items-center justify-center text-[10px] font-bold">M</span>
              Max
            </a>
          </div>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </div>
  );
};

export default ContactsPage;
