import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceRepair from "@/assets/service-repair.jpg";

const services = [
  {
    title: "Установка входных дверей",
    desc: "Монтаж металлических входных дверей.",
    image: serviceEntrance,
    filterType: "entrance",
  },
  {
    title: "Установка межкомнатных дверей",
    desc: "Профессиональная установка всех типов дверей и раздвижных систем.",
    image: serviceInterior,
    filterType: "interior",
  },
  {
    title: "Замер",
    desc: "Выезд мастера для составления технического задания.",
    image: serviceRepair,
    filterType: "repair",
  },
];

const ServiceCard = ({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      to={`/services?type=${service.filterType}`}
      className="group block"
    >
      <div
        ref={cardRef}
        className="relative rounded-xl overflow-hidden"
        style={{
          opacity: 0,
          transform: "translateY(30px)",
          transition: `opacity 0.7s ease-out ${index * 0.15}s, transform 0.7s ease-out ${index * 0.15}s`,
          boxShadow: "0 20px 50px -15px rgba(0,0,0,0.6)",
          aspectRatio: "3/4",
        }}
      >
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, hsl(50 14% 5% / 0.85) 0%, hsl(50 14% 5% / 0.3) 50%, transparent 70%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          <h3 className="font-display text-lg md:text-xl font-light text-doorium-platinum mb-1 tracking-wide">
            {service.title}
          </h3>
          <p className="font-body text-xs md:text-sm font-light text-doorium-platinum/60 leading-relaxed">
            {service.desc}
          </p>
        </div>
      </div>
    </Link>
  );
};

const Services = () => {
  return (
    <section
      id="services"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "hsl(50 14% 5%)" }}
    >
      {/* Section header */}
      <div className="px-8 md:px-16 lg:px-24 mb-12 md:mb-16 text-center">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum tracking-wide">
          <span className="text-primary">•</span> Услуги
        </h2>
      </div>

      {/* Grid: info block + 3 cards */}
      <div className="px-4 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {/* Info block */}
          <div
            className="rounded-xl p-6 md:p-8 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, hsl(50 14% 12%) 0%, hsl(50 14% 8%) 100%)",
              boxShadow: "0 20px 50px -15px rgba(0,0,0,0.4)",
            }}
          >
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-light text-doorium-platinum mb-4 tracking-wide leading-tight">
                Мы лучшие в своём деле!
              </h3>
              <p className="font-body text-sm font-light text-doorium-platinum/60 leading-relaxed mb-8">
                Doorium — лидирующая компания с 20-летним опытом профессионального
                монтажа всех видов дверей и современных раздвижных систем. Высший
                рейтинг доверия в дверной отрасли. Качественное гарантийное и
                постгарантийное обслуживание.
              </p>
            </div>
            <a
              href="#contacts"
              className="inline-block font-body text-sm font-medium tracking-[0.12em] uppercase px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300 rounded-sm text-center"
            >
              Оставить заявку
            </a>
          </div>

          {/* Service cards */}
          {services.map((service, i) => (
            <ServiceCard key={service.filterType} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
