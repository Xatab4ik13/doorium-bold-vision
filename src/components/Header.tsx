import { useState, useRef, useCallback, useEffect } from "react";
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

const useRouterNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = useCallback(
    (href: string, cb?: () => void) => {
      cb?.();
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

  return handleNav;
};

const MagneticLink = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: (href: string) => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;
    setTransform(`translate(${deltaX}px, ${deltaY}px)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("translate(0px, 0px)");
  }, []);

  return (
    <button
      ref={ref}
      onClick={() => onClick(href)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative font-display-stencil text-base font-normal tracking-[0.25em] text-doorium-platinum uppercase px-6 py-3 transition-colors duration-300 hover:text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] bg-transparent border-none cursor-pointer"
      style={{
        transform,
        transition: "transform 0.25s cubic-bezier(0.33, 1, 0.68, 1), color 0.3s",
      }}
    >
      {label}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-3/4" />
    </button>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNav = useRouterNav();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Logo — NOT clickable */}
      <div className="absolute top-0 -left-6 md:-left-4 z-40 overflow-hidden pointer-events-none">
        <img
          src={dooriumLogo}
          alt="Doorium Service"
          className="h-56 md:h-[28rem] w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] -mt-16 md:-mt-32"
        />
      </div>

      {/* Navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 md:px-10 py-5">
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <MagneticLink
              key={item.href}
              href={item.href}
              label={item.label}
              onClick={handleNav}
            />
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden text-doorium-platinum z-[80] ml-auto relative"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          <Menu
            size={28}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <X
            size={28}
            className={`transition-all duration-300 ${
              mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
            }`}
          />
        </button>
      </header>

      {/* ── Mobile menu: the puzzle piece that completes the Hero wave ── */}
      <div
        className={`md:hidden fixed inset-0 z-[65] transition-opacity duration-500 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none invisible"
        }`}
        style={{ transitionDelay: mobileOpen ? "0s" : "0.3s" }}
      >
        {/*
          The SVG fills the ENTIRE screen.
          The path is the exact complement of the Hero wave:
          Hero fills left side → menu fills right side.
          Together they form a complete rectangle.
        */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          {/* Exact complement of Hero wave path */}
          <path
            d="M700,0 C720,75 620,150 660,225 C700,300 600,375 640,450 C680,525 580,600 620,675 C660,750 600,825 640,900 L1440,900 L1440,0 Z"
            className="fill-secondary"
          />
        </svg>

        {/* Close button inside the menu */}
        <button
          className="absolute top-5 right-5 text-doorium-platinum/70 hover:text-primary transition-colors duration-300 pointer-events-auto z-10"
          onClick={() => setMobileOpen(false)}
          aria-label="Закрыть меню"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity 0.3s ease-out 0.2s",
          }}
        >
          <X size={28} />
        </button>

        {/* Menu content — positioned on right side, over the SVG shape */}
        <div
          className="absolute top-0 right-0 bottom-0 flex flex-col justify-center px-8 pointer-events-auto"
          style={{
            width: "55%",
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href, () => setMobileOpen(false))}
                className="font-display-stencil text-lg font-normal tracking-[0.2em] text-doorium-platinum/80 hover:text-primary transition-all duration-300 uppercase py-3 text-left bg-transparent border-none cursor-pointer"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateX(0)" : "translateX(30px)",
                  transition: `opacity 0.35s ease-out ${0.25 + i * 0.06}s, transform 0.35s ease-out ${0.25 + i * 0.06}s, color 0.3s`,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div
            className="mt-8 pt-4 border-t border-border/20"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transition: "opacity 0.4s ease-out 0.6s",
            }}
          >
            <a href="tel:+74951234567" className="font-body text-xs tracking-wider text-doorium-platinum/50 hover:text-primary transition-colors block mb-1.5">
              +7 (495) 123-45-67
            </a>
            <a href="mailto:info@doorium.ru" className="font-body text-xs tracking-wider text-doorium-platinum/50 hover:text-primary transition-colors block">
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
