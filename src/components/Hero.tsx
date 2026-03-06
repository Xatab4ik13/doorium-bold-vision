const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-doorium-darker" />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-doorium-dark/60 via-doorium-dark/30 to-doorium-dark/80" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
