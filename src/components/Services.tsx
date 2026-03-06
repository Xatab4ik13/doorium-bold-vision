import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceRepair from "@/assets/service-repair.jpg";

const services = [
  {
    title: "УСТАНОВКА\nМЕЖКОМНАТНЫХ\nДВЕРЕЙ",
    desc: "Профессиональный монтаж любой сложности с гарантией идеальной геометрии и бесшумной работы механизмов.",
    image: serviceInterior,
    filterType: "interior",
  },
  {
    title: "УСТАНОВКА\nВХОДНЫХ\nДВЕРЕЙ",
    desc: "Надёжная установка входных дверей с полной герметизацией, утеплением и регулировкой фурнитуры.",
    image: serviceEntrance,
    filterType: "entrance",
  },
  {
    title: "РЕКЛАМАЦИЯ",
    desc: "Устранение дефектов, регулировка и восстановление дверных конструкций любых производителей.",
    image: serviceRepair,
    filterType: "repair",
  },
];

const ServiceStrip = ({
  service,
  isEven,
  index,
}: {
  service: (typeof services)[0];
  isEven: boolean;
  index: number;
}) => {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "rotate(0deg)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initial "fallen" rotation: even strips tilt right, odd tilt left
  const initialRotation = isEven ? "rotate(3deg)" : "rotate(-3deg)";
  // Hover lifts the higher corner slightly
  const hoverRotation = isEven ? "rotate(-0.5deg)" : "rotate(0.5deg)";

  return (
    <Link
      to={`/services?type=${service.filterType}`}
      className="group block relative cursor-pointer"
      onMouseEnter={() => {
        if (stripRef.current) {
          stripRef.current.style.transform = hoverRotation;
        }
      }}
      onMouseLeave={() => {
        if (stripRef.current) {
          stripRef.current.style.transform = "rotate(0deg)";
        }
      }}
    >
      <div
        ref={stripRef}
        className="relative py-12 md:py-16 overflow-hidden"
        style={{
          opacity: 0,
          transform: initialRotation,
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out",
          transitionDelay: `${index * 0.15}s`,
          transformOrigin: isEven ? "left center" : "right center",
          clipPath: isEven
            ? "polygon(0 0, 100% 8%, 100% 100%, 0 92%)"
            : "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
        }}
      >
        {/* Background image */}
        <img
          src={service.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Diagonal border lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderTop: "1px solid hsl(34 24% 48% / 0.3)",
            borderBottom: "1px solid hsl(34 24% 48% / 0.3)",
          }}
        />

        <div className="relative z-10 px-8 md:px-16 lg:px-24 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16">
          <div className="flex-1">
            <h3 className="font-display-stencil text-2xl md:text-3xl lg:text-4xl text-doorium-platinum leading-[1.1] whitespace-pre-line group-hover:text-primary transition-colors duration-700 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {service.title}
            </h3>
          </div>

          <p className="hidden md:block max-w-xs font-body text-sm text-doorium-platinum/70 group-hover:text-doorium-platinum transition-colors duration-700 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
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
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: "hsl(50 14% 8%)",
      }}
    >
      <div className="relative z-10 px-8 md:px-16 lg:px-24 mb-16 md:mb-24">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Что мы делаем
        </p>
        <h2 className="font-display-stencil text-4xl md:text-5xl lg:text-6xl text-doorium-platinum leading-[0.95]">
          УСЛУГИ
        </h2>
      </div>

      <div className="relative z-10 space-y-0">
        {services.map((service, i) => (
          <ServiceStrip
            key={service.title}
            service={service}
            isEven={i % 2 === 0}
            index={i}
          />
        ))}
      </div>

    </section>
  );
};

export default Services;
