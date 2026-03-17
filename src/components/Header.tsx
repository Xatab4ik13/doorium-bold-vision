import { useState, useCallback, useEffect, forwardRef } from "react";
import { LogIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "/services" },
  { label: "Заявка", href: "/#contacts" },
  { label: "Новости", href: "/#news" },
  { label: "Контакты", href: "/contacts" },
  { label: "Вакансии", href: "/careers" },
  { label: "Стать Партнёром", href: "/partner" },
];

const Header = forwardRef<HTMLElement>((_, ref) => {
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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-start md:justify-center px-4 md:px-6 py-0">
        <button
          onClick={() => handleNav("/")}
          className="bg-transparent border-none cursor-pointer p-0 -mt-8 md:-mt-10"
        >
          <img
            src={dooriumLogo}
            alt="Doorium Service"
            className="h-[8rem] md:h-[11rem] w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          />
        </button>

        <button
          className="absolute right-6 top-5 text-doorium-platinum z-[80]"
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
        <div className="flex items-center justify-between px-6 py-3 overflow-hidden">
          <img
            src={dooriumLogo}
            alt="Doorium"
            className="h-[10rem] w-auto brightness-0 invert opacity-70 -mt-8 -mb-8"
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="text-doorium-platinum/60 hover:text-primary transition-colors duration-300 shrink-0"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-px bg-border/15 mx-6" />

        {/* Nav links */}
        <div className="flex-1 flex flex-col justify-center px-6 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className="font-display text-lg font-light tracking-[0.1em] text-doorium-platinum/70 hover:text-primary hover:pl-2 transition-all duration-200 uppercase py-2.5 text-left bg-transparent border-none cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-border/15 my-2" />
          <button
            onClick={() => handleNav("/login")}
            className="font-display text-lg font-light tracking-[0.1em] text-doorium-platinum/70 hover:text-primary hover:pl-2 transition-all duration-200 uppercase py-2.5 text-left bg-transparent border-none cursor-pointer flex items-center gap-3"
          >
            <LogIn size={18} className="opacity-50" />
            Кабинет
          </button>
        </div>

        {/* Contact info + social */}
        <div className="px-6 pb-8">
          <div className="h-px bg-border/15 mb-5" />
          <div className="mb-3">
            <p className="font-body text-[10px] tracking-wider text-doorium-platinum/30 mb-1">Москва</p>
            <a
              href="tel:+79168191996"
              className="block font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors"
            >
              8 (916) 819-19-96
            </a>
          </div>
          <div className="mb-3">
            <p className="font-body text-[10px] tracking-wider text-doorium-platinum/30 mb-1">Санкт-Петербург</p>
            <a
              href="tel:+79268637008"
              className="block font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors"
            >
              +7 (926) 863-70-08
            </a>
          </div>
          <a
            href="mailto:info@doorium.ru"
            className="block font-body text-sm tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors mb-4"
          >
            info@doorium.ru
          </a>
          {/* Social links */}
          <div className="flex gap-3">
            <a
              href="https://t.me/Doorium_service"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-doorium-platinum/10 flex items-center justify-center text-doorium-platinum/40 hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Telegram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <a
              href="https://max.ru/u/f9LHodD0cOJMEjKWRIkz2LvqUetirYd-JBWylARJJOTxfauqq9Q_PPRR9-4"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-doorium-platinum/10 flex items-center justify-center text-doorium-platinum/40 hover:text-primary hover:bg-primary/10 transition-colors text-xs font-bold"
              aria-label="Max"
            >
              M
            </a>
          </div>
        </div>
      </nav>
    </>
  );
});

Header.displayName = "Header";

export default Header;
