import heroImage from "@/assets/hero-interior.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col md:flex-row">
      {/* Left: Content */}
      <div className="relative z-10 flex flex-col justify-center w-full md:w-1/2 h-1/2 md:h-full bg-secondary px-8 md:px-16 lg:px-24">
        <div className="max-w-lg">
          <p className="font-body text-sm md:text-base tracking-[0.3em] uppercase text-primary mb-4 animate-fade-in-up">
            Doorium Service
          </p>
          <h1 className="font-display-stencil text-5xl md:text-6xl lg:text-7xl font-normal leading-[0.95] text-doorium-platinum mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            ПРЕМИАЛЬНЫЙ
            <br />
            МОНТАЖ
          </h1>
          <p className="font-body text-base md:text-lg text-doorium-platinum/60 mb-8 max-w-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Установка межкомнатных и входных дверей
            с гарантией качества в&nbsp;Москве
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <a
              href="#contacts"
              className="inline-block font-display-stencil text-sm font-normal tracking-widest uppercase px-8 py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-doorium-chamoisee/80 transition-all duration-300"
            >
              Оставить заявку
            </a>
          </div>
        </div>
      </div>

      {/* Zigzag divider — photo side bites into text side */}
      <div className="absolute top-0 bottom-0 left-[35%] md:left-[38%] w-[18%] md:w-[14%] z-20 pointer-events-none">
        <svg
          viewBox="0 0 200 1000"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M200,0 L200,0 L80,0 L0,100 L160,200 L0,300 L160,400 L0,500 L160,600 L0,700 L160,800 L0,900 L80,1000 L200,1000 Z"
            className="fill-secondary"
          />
        </svg>
      </div>

      {/* Right: Photo */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
        <img
          src={heroImage}
          alt="Премиальный интерьер с дверьми"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-doorium-smoky/20" />
      </div>
    </section>
  );
};

export default Hero;