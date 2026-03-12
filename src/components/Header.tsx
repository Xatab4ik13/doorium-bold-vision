import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "/services" },
  { label: "Портфолио", href: "/portfolio" },
  { label: "Заявка", href: "/#contacts" },
  { label: "Новости", href: "/#news" },
  { label: "Контакты", href: "/contacts" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = useCallback(
    (href: string) => {
      setMenuOpen(false);
      if (href.startsWith("/#")) {
        const hash = href.slice(1);
        if (location.pathname === "/") {
          const el = document.querySelector(hash);
          el?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/");
          setTimeout(() => {
            const el = document.querySelector(hash);
            el?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
        return;
      }
      navigate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Top bar: logo center + burger right */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4">
        {/* Centered logo */}
        <button
          onClick={() => handleNav("/")}
          className="bg-transparent border-none cursor-pointer p-0"
        >
          <img
            src={dooriumLogo}
            alt="Doorium Service"
            className="h-10 md:h-14 w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          />
        </button>

        {/* Burger — always visible */}
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 text-doorium-platinum z-[80]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <Menu
            size={28}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <X
            size={28}
            className={`transition-all duration-300 ${
              menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
            }`}
          />
        </button>
      </header>

      {/* Full-screen menu overlay */}
      <div
        className={`fixed inset-0 z-[65] transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-doorium-smoky/95 backdrop-blur-md" />

        <button
          className="absolute top-5 right-6 text-doorium-platinum/70 hover:text-primary transition-colors duration-300 z-10"
          onClick={() => setMenuOpen(false)}
          aria-label="Закрыть меню"
        >
          <X size={28} />
        </button>

        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item, i) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="font-display text-2xl md:text-3xl font-light tracking-[0.15em] text-doorium-platinum/80 hover:text-primary transition-all duration-300 uppercase py-2 bg-transparent border-none cursor-pointer"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.4s ease-out ${0.15 + i * 0.06}s, transform 0.4s ease-out ${0.15 + i * 0.06}s, color 0.3s`,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div
            className="mt-10 flex flex-col items-center gap-2"
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 0.4s ease-out 0.6s",
            }}
          >
            <a href="tel:+74951234567" className="font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors">
              +7 (495) 123-45-67
            </a>
            <a href="mailto:info@doorium.ru" className="font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors">
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
