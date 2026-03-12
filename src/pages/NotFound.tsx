import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(50 14% 5%)" }}
    >
      <Header />
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <h1 className="font-display text-8xl md:text-9xl font-light text-primary mb-4 tracking-wide">
            404
          </h1>
          <p className="font-body text-lg text-doorium-platinum/60 mb-8">
            Страница не найдена
          </p>
          <a
            href="/"
            className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300 rounded-sm"
          >
            На главную
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
