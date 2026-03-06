import heroImage from "@/assets/hero-interior.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={heroImage}
        alt="Премиальный интерьер с дверьми"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-doorium-dark/40" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;