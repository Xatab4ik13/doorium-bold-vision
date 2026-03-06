import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

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
  {
    icon: MapPin,
    title: "АДРЕС",
    lines: ["г. Москва, ул. Примерная, д. 10", "офис 205"],
  },
  {
    icon: Clock,
    title: "РЕЖИМ РАБОТЫ",
    lines: ["Пн–Пт: 09:00 – 20:00", "Сб: 10:00 – 18:00"],
  },
];

const ContactsPage = () => {
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
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item) => (
            <div
              key={item.title}
              className="border border-border/20 p-8 group hover:border-primary/40 transition-colors duration-500"
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

      {/* Map placeholder */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="w-full h-[300px] md:h-[400px] border border-border/20 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-primary/40 mx-auto mb-3" strokeWidth={1} />
              <p className="font-body text-sm text-muted-foreground tracking-wider uppercase">
                Москва
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <ContactForm />
    </div>
  );
};

export default ContactsPage;
