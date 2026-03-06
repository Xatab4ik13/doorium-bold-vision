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

      {/* Logo — top left, large */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <img src={logo} alt="Doorium Service" className="h-20 md:h-28 w-auto" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
