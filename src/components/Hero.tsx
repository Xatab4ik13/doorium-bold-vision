import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background placeholder — replace with real photo */}
      <div className="absolute inset-0 bg-doorium-darker" />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-doorium-dark/60 via-doorium-dark/30 to-doorium-dark/80" />

      {/* Content */}
      <div className="relative z-10 container text-center md:text-left max-w-5xl">
        <div className="animate-fade-in-up">
          {/* Accent line */}
          <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
            <span className="w-12 h-[2px] bg-doorium-gold" />
            <span className="font-body text-sm tracking-[0.3em] text-doorium-gold uppercase">
              Doorium Service
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-doorium-text-light leading-[0.95] mb-6">
            Премиальный
            <br />
            <span className="text-doorium-gold">Монтаж</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base md:text-lg text-doorium-grey-light max-w-xl mb-10 leading-relaxed mx-auto md:mx-0">
            Профессиональная установка межкомнатных и входных дверей.
            <br className="hidden md:block" />
            Точность, качество, гарантия на все работы.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button className="bg-doorium-gold hover:bg-doorium-gold-light text-doorium-dark font-display text-base tracking-wider px-10 py-6 uppercase">
              Оставить заявку
            </Button>
            <Button
              variant="outline"
              className="border-doorium-grey text-doorium-grey-light hover:border-doorium-gold hover:text-doorium-gold font-display text-base tracking-wider px-10 py-6 uppercase bg-transparent"
            >
              Наши работы
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
