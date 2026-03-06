import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { Phone, Mail } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "ТЕЛЕФОН",
    lines: ["+7 (495) 123-45-67", "+7 (926) 987-65-43"],
  },
  {
    icon: Mail,
    title: "ПОЧТА",
    lines: ["info@doorium.ru"],
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

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom, hsl(50 14% 8%) 0%, hsl(60 8% 13%) 50%, hsl(70 7% 16%) 100%)",
      }}
    >
      <Header />

      {/* Hero */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-24 px-8 md:px-16 lg:px-24">
        <div ref={hero.ref} style={hero.style} className="max-w-5xl mx-auto">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
            Doorium Service
          </p>
          <h1 className="font-display-stencil text-5xl md:text-7xl lg:text-8xl text-doorium-platinum leading-[0.9] mb-6">
            КОНТАКТЫ
          </h1>
          <div className="w-16 h-[2px] bg-primary" />
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div
          ref={cards.ref}
          style={cards.style}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg sm:max-w-2xl mx-auto"
        >
          {contactInfo.map((item, i) => (
            <div
              key={item.title}
              className="border border-border/20 p-8 group hover:border-primary/40 transition-colors duration-500"
              style={{
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <item.icon
                className="w-6 h-6 text-primary mb-5"
                strokeWidth={1.5}
              />
              <h3 className="font-display-stencil text-xs tracking-[0.25em] text-primary mb-4">
                {item.title}
              </h3>
              {item.lines.map((line) => (
                <p
                  key={line}
                  className="font-body text-sm text-doorium-platinum/70 leading-relaxed"
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <ContactForm />
    </div>
  );
};

export default ContactsPage;
