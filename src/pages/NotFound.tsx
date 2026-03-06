import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(50 14% 8%)" }}
    >
      <Header />
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <h1 className="font-display-stencil text-8xl md:text-9xl text-primary mb-4">
            404
          </h1>
          <p className="font-body text-lg text-doorium-platinum/60 mb-8">
            Страница не найдена
          </p>
          <a
            href="/"
            className="inline-block font-display-stencil text-sm tracking-[0.2em] uppercase px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
