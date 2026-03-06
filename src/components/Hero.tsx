import heroVideo from "@/assets/hero-video.mp4";
import heroImage from "@/assets/hero-interior.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Bottom layer: full-width video */}
      <video
        src={heroVideo}
        poster={heroImage}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-doorium-smoky/20" />
      {/* Bottom gradient fade into next section (Smoky Black) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-72 z-30 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, hsl(50 14% 8% / 0.1) 20%, hsl(50 14% 8% / 0.4) 50%, hsl(50 14% 8% / 0.8) 75%, hsl(50 14% 8%) 100%)",
        }}
      />

      {/* Top layer: dark overlay with zigzag cut on the right */}
      <div className="absolute inset-0 z-10 hidden md:block">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,0 L700,0 C720,75 620,150 660,225 C700,300 600,375 640,450 C680,525 580,600 620,675 C660,750 600,825 640,900 L0,900 Z"
            className="fill-secondary"
          />
        </svg>
      </div>

      {/* Mobile: full dark overlay for readability */}
      <div className="absolute inset-0 z-10 md:hidden bg-doorium-smoky/60" />

      {/* Content on top of the dark mask */}
      <div className="absolute inset-0 z-20 flex items-end pb-32 md:items-center md:pb-0">
        <div className="w-full md:w-1/2 px-6 md:px-16 lg:px-24">
          <div className="max-w-lg">
            <p className="font-body text-xs md:text-base tracking-[0.3em] uppercase text-primary mb-3 md:mb-4 animate-fade-in-up">
              Doorium Service
            </p>
            <h1 className="font-display-stencil text-4xl md:text-6xl lg:text-7xl font-normal leading-[0.95] text-doorium-platinum mb-4 md:mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              ПРЕМИАЛЬНЫЙ
              <br />
              МОНТАЖ
            </h1>
            <p className="font-body text-sm md:text-lg text-doorium-platinum/70 mb-6 md:mb-8 max-w-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Установка межкомнатных и входных дверей
              с гарантией качества в&nbsp;Москве
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <a
                href="#contacts"
                className="inline-block font-display-stencil text-xs md:text-sm font-normal tracking-widest uppercase px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-doorium-chamoisee/80 transition-all duration-300"
              >
                Оставить заявку
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;