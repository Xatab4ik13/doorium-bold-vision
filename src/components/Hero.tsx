import heroImage from "@/assets/hero-interior.jpg";
import logo from "@/assets/doorium-logo.png";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-screen background image */}
      <img
        src={heroImage}
        alt="Премиальный интерьер с дверьми"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-doorium-dark/40" />

      {/* Logo — fixed top left, large */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-50">
        <img src={logo} alt="Doorium Service" className="h-36 md:h-56 w-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
