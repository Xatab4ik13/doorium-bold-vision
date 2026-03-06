import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "/services" },
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

      // Hash link on another page → navigate first, then scroll
      if (href.startsWith("/#")) {
        const hash = href.slice(1); // e.g. #contacts
        if (location.pathname === "/") {
          const el = document.querySelector(hash);
          el?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/");
          // wait for page render then scroll
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
        transition:
          "transform 0.25s cubic-bezier(0.33, 1, 0.68, 1), color 0.3s",
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Logo — NOT clickable */}
      <div className="absolute top-0 -left-6 md:-left-4 z-[60] overflow-hidden pointer-events-none">
        <img
          src={dooriumLogo}
          alt="Doorium Service"
          className="h-80 md:h-[28rem] w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] -mt-24 md:-mt-32"
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
          className="md:hidden text-doorium-platinum z-[70] ml-auto relative"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile menu — slides from right with wave edge */}
      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-doorium-smoky/60 backdrop-blur-sm transition-opacity duration-500 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-[65] w-[80%] max-w-[320px] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Wave edge SVG on the left side */}
        <div className="absolute top-0 bottom-0 -left-[60px] w-[60px] overflow-hidden">
          <svg
            viewBox="0 0 60 900"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M60,0 C40,75 60,150 40,225 C20,300 60,375 40,450 C20,525 60,600 40,675 C20,750 60,825 40,900 L60,900 Z"
              className="fill-secondary"
            />
          </svg>
        </div>

        {/* Menu content */}
        <div className="relative h-full bg-secondary flex flex-col justify-center px-8">
          <nav className="flex flex-col gap-2">
            {navItems.map((item, i) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href, () => setMobileOpen(false))}
                className="font-display-stencil text-xl font-normal tracking-[0.2em] text-doorium-platinum/80 hover:text-primary transition-all duration-300 uppercase py-4 text-left bg-transparent border-none cursor-pointer"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen
                    ? "translateX(0)"
                    : "translateX(30px)",
                  transition: `opacity 0.4s ease-out ${0.15 + i * 0.08}s, transform 0.4s ease-out ${0.15 + i * 0.08}s, color 0.3s`,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact info at bottom */}
          <div
            className="mt-12 pt-6 border-t border-border/20"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transition: "opacity 0.5s ease-out 0.6s",
            }}
          >
            <a
              href="tel:+74951234567"
              className="font-body text-sm tracking-wider text-doorium-platinum/50 hover:text-primary transition-colors block mb-2"
            >
              +7 (495) 123-45-67
            </a>
            <a
              href="mailto:info@doorium.ru"
              className="font-body text-sm tracking-wider text-doorium-platinum/50 hover:text-primary transition-colors block"
            >
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
