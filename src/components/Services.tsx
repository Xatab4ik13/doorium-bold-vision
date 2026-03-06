const services = [
  {
    num: "01",
    title: "УСТАНОВКА\nМЕЖКОМНАТНЫХ\nДВЕРЕЙ",
    desc: "Профессиональный монтаж любой сложности с гарантией идеальной геометрии и бесшумной работы механизмов.",
  },
  {
    num: "02",
    title: "УСТАНОВКА\nВХОДНЫХ\nДВЕРЕЙ",
    desc: "Надёжная установка входных дверей с полной герметизацией, утеплением и регулировкой фурнитуры.",
  },
  {
    num: "03",
    title: "РЕКЛАМАЦИЯ",
    desc: "Устранение дефектов, регулировка и восстановление дверных конструкций любых производителей.",
  },
];

const Services = () => {
  return (
    <section
      id="services"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(70 7% 16%) 0%, hsl(240 2% 90%) 100%)",
      }}
    >
      {/* Section heading */}
      <div className="relative z-10 px-8 md:px-16 lg:px-24 mb-16 md:mb-24">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Что мы делаем
        </p>
        <h2 className="font-display-stencil text-4xl md:text-5xl lg:text-6xl text-doorium-platinum leading-[0.95]">
          УСЛУГИ
        </h2>
      </div>

      {/* Diagonal service strips */}
      <div className="relative z-10 space-y-0">
        {services.map((service, i) => {
          const isEven = i % 2 === 0;
          return (
            <a
              key={service.num}
              href="#contacts"
              className="group block relative cursor-pointer"
            >
              {/* Diagonal strip */}
              <div
                className="relative py-12 md:py-16 transition-colors duration-500 group-hover:bg-primary/10"
                style={{
                  clipPath: isEven
                    ? "polygon(0 0, 100% 8%, 100% 100%, 0 92%)"
                    : "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
                }}
              >
                {/* Diagonal border line */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderTop: "1px solid hsl(34 24% 48% / 0.3)",
                    borderBottom: "1px solid hsl(34 24% 48% / 0.3)",
                  }}
                />

                <div className="px-8 md:px-16 lg:px-24 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16">
                  {/* Large number */}
                  <span
                    className="font-display-stencil text-[6rem] md:text-[8rem] lg:text-[10rem] leading-none text-primary/20 group-hover:text-primary/40 transition-colors duration-500 select-none"
                    style={{
                      transform: isEven ? "rotate(-3deg)" : "rotate(3deg)",
                    }}
                  >
                    {service.num}
                  </span>

                  {/* Title */}
                  <div className="flex-1">
                    <h3
                      className="font-display-stencil text-2xl md:text-3xl lg:text-4xl text-doorium-platinum leading-[1.1] whitespace-pre-line group-hover:text-primary transition-colors duration-500"
                    >
                      {service.title}
                    </h3>
                  </div>

                  {/* Description — hidden on mobile, shown on md+ */}
                  <p className="hidden md:block max-w-xs font-body text-sm text-doorium-platinum/50 group-hover:text-doorium-platinum/80 transition-colors duration-500 leading-relaxed">
                    {service.desc}
                  </p>

                  {/* Arrow */}
                  <span className="font-display-stencil text-3xl md:text-4xl text-primary/30 group-hover:text-primary group-hover:translate-x-3 transition-all duration-500">
                    →
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
