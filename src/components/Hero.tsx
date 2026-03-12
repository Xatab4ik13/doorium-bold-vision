import { useEffect, useRef } from "react";
import { Home, Target, Shield } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";
import heroImage from "@/assets/hero-interior.jpg";

const features = [
  {
    icon: Home,
    title: "СОВРЕМЕННОЕ\nОБОРУДОВАНИЕ",
  },
  {
    icon: Target,
    title: "ТОЧНОСТЬ\nИ АККУРАТНОСТЬ",
  },
  {
    icon: Shield,
    title: "ГАРАНТИЯ\nКАЧЕСТВА",
  },
];

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        const handleInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", handleInteraction);
          document.removeEventListener("click", handleInteraction);
        };
        document.addEventListener("touchstart", handleInteraction, { once: true });
        document.addEventListener("click", handleInteraction, { once: true });
      });
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-width video background */}
      <video
        ref={videoRef}
        src={heroVideo}
        poster={heroImage}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Left-side gradient overlay for text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, hsl(50 14% 5% / 0.85) 0%, hsl(50 14% 5% / 0.7) 35%, hsl(50 14% 5% / 0.3) 60%, transparent 80%)",
        }}
      />

      {/* Bottom fade to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, hsl(50 14% 5%) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full md:w-3/5 px-8 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <h1
              className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[1] text-doorium-platinum mb-6 md:mb-8 animate-fade-in-up tracking-wide"
            >
              ПРОФЕССИОНАЛЬНЫЙ
              <br />
              МОНТАЖ ДВЕРЕЙ
            </h1>
            <p
              className="font-body text-sm sm:text-base md:text-lg font-light text-doorium-platinum/70 mb-8 md:mb-10 max-w-md animate-fade-in-up tracking-wide uppercase"
              style={{ animationDelay: "0.2s" }}
            >
              Услуги по установке{" "}
              <span className="font-medium text-doorium-platinum">межкомнатных</span>
              {" "}и{" "}
              <span className="font-medium text-doorium-platinum">входных дверей</span>
              {" "}с гарантией
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <a
                href="#contacts"
                className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300 rounded-sm"
              >
                Оставить заявку
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards at bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-3 md:px-16 lg:px-24">
        <div className="grid grid-cols-3 gap-2 md:gap-5 max-w-5xl">
          {features.map((feature, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${0.5 + i * 0.1}s`,
                background: "linear-gradient(135deg, hsl(50 14% 12% / 0.9) 0%, hsl(50 14% 8% / 0.95) 100%)",
                boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px hsl(34 24% 48% / 0.15)",
              }}
            >
              <div className="px-4 md:px-6 py-5 md:py-7 flex flex-col items-start gap-3">
                <feature.icon
                  size={28}
                  className="text-primary"
                  strokeWidth={1.5}
                />
                <p className="font-body text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-doorium-platinum leading-relaxed whitespace-pre-line">
                  {feature.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
