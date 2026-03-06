import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceRepair from "@/assets/service-repair.jpg";

const services = [
  {
    num: "01",
    title: "УСТАНОВКА\nМЕЖКОМНАТНЫХ ДВЕРЕЙ",
    desc: "Профессиональный монтаж любой сложности с гарантией идеальной геометрии и бесшумной работы механизмов.",
    image: serviceInterior,
  },
  {
    num: "02",
    title: "УСТАНОВКА\nВХОДНЫХ ДВЕРЕЙ",
    desc: "Надёжная установка входных дверей с полной герметизацией, утеплением и регулировкой фурнитуры.",
    image: serviceEntrance,
  },
  {
    num: "03",
    title: "РЕКЛАМАЦИЯ",
    desc: "Устранение дефектов, регулировка и восстановление дверных конструкций любых производителей.",
    image: serviceRepair,
  },
];

const Services = () => {
  return (
    <section id="services" className="relative overflow-hidden">
      {/* Section heading */}
      <div
        className="relative z-10 px-8 md:px-16 lg:px-24 py-16 md:py-24"
        style={{
          background: "hsl(70 7% 16%)",
        }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Что мы делаем
        </p>
        <h2 className="font-display-stencil text-4xl md:text-5xl lg:text-6xl text-doorium-platinum leading-[0.95]">
          УСЛУГИ
        </h2>
      </div>

      {/* Full-bleed image service blocks */}
      {services.map((service, i) => {
        const isEven = i % 2 === 0;
        return (
          <a
            key={service.num}
            href="#contacts"
            className="group block relative h-[50vh] md:h-[70vh] overflow-hidden cursor-pointer"
          >
            {/* Background image */}
            <img
              src={service.image}
              alt={service.title.replace(/\n/g, " ")}
              className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.2s] ease-out"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-secondary/70 group-hover:bg-secondary/50 transition-colors duration-700" />

            {/* Diagonal chamoisee accent line */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderBottom: "1px solid hsl(34 24% 48% / 0.4)",
              }}
            />

            {/* Content */}
            <div className={`absolute inset-0 z-10 flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-12 md:pb-16 ${isEven ? "items-start" : "md:items-end"}`}>
              {/* Number — large, positioned at top */}
              <span
                className={`absolute top-6 md:top-10 font-display-stencil text-[7rem] md:text-[10rem] lg:text-[14rem] leading-none text-primary/10 group-hover:text-primary/20 transition-colors duration-700 select-none ${isEven ? "right-8 md:right-16 lg:right-24" : "left-8 md:left-16 lg:left-24"}`}
              >
                {service.num}
              </span>

              <h3
                className={`font-display-stencil text-3xl md:text-4xl lg:text-5xl text-doorium-platinum leading-[1.05] whitespace-pre-line group-hover:text-primary transition-colors duration-500 mb-4 ${isEven ? "text-left" : "md:text-right"}`}
              >
                {service.title}
              </h3>

              <p
                className={`font-body text-sm md:text-base text-doorium-platinum/50 group-hover:text-doorium-platinum/80 transition-colors duration-500 max-w-md leading-relaxed ${isEven ? "text-left" : "md:text-right"}`}
              >
                {service.desc}
              </p>
            </div>
          </a>
        );
      })}
    </section>
  );
};

export default Services;
