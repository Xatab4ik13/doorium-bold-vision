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
          setTimeout(() => {
            const el = document.querySelector(hash);
            el?.scrollIntoView({ behavior: "smooth" });
          }, 350);
        } else {
          navigate("/");
          setTimeout(() => {
            const el = document.querySelector(hash);
            el?.scrollIntoView({ behavior: "smooth" });
          }, 600);
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Top bar: logo center + burger right */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4">
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

        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 text-doorium-platinum z-[80]"
          onClick={() => setMenuOpen(true)}
          aria-label="Меню"
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/40"
        onClick={() => setMenuOpen(false)}
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Side drawer from right — rounded left corners */}
      <nav
        className="fixed top-3 right-3 bottom-3 z-[80] w-[280px] md:w-[340px] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "hsl(50 14% 7%)",
          boxShadow: menuOpen ? "-8px 0 40px rgba(0,0,0,0.5)" : "none",
          transform: menuOpen ? "translateX(0)" : "translateX(calc(100% + 12px))",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        {/* Close + logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <img
            src={dooriumLogo}
            alt="Doorium"
            className="h-9 w-auto brightness-0 invert opacity-70"
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="text-doorium-platinum/60 hover:text-primary transition-colors duration-300"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-px bg-border/15 mx-6" />

        {/* Nav links */}
        <div className="flex-1 flex flex-col justify-center px-6">
          {navItems.map((item, i) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className="font-display text-xl font-light tracking-[0.1em] text-doorium-platinum/70 hover:text-primary hover:pl-2 transition-all duration-300 uppercase py-3 text-left bg-transparent border-none cursor-pointer"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0)" : "translateX(20px)",
                transition: `opacity 0.35s ease-out ${0.15 + i * 0.04}s, transform 0.35s ease-out ${0.15 + i * 0.04}s, color 0.3s, padding 0.3s`,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Contact info */}
        <div className="px-6 pb-8">
          <div className="h-px bg-border/15 mb-5" />
          <a
            href="tel:+74951234567"
            className="block font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors mb-1.5"
          >
            +7 (495) 123-45-67
          </a>
          <a
            href="mailto:info@doorium.ru"
            className="block font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors"
          >
            info@doorium.ru
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
