import Header from "@/components/Header";
import Hero from "@/components/Hero";
import logo from "@/assets/doorium-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed logo — top left, always visible above everything */}
      <a href="/" className="fixed top-4 left-4 md:top-6 md:left-6 z-[60]">
        <img
          src={logo}
          alt="Doorium Service"
          className="h-24 md:h-32 w-auto brightness-[1.8] contrast-125 drop-shadow-[0_2px_20px_rgba(255,255,255,0.4)]"
        />
      </a>
      <Header />
      <Hero />
    </div>
  );
};

export default Index;