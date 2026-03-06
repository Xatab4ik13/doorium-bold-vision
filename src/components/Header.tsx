import { useState, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navItems = [
  { label: "Услуги", href: "/services" },
  { label: "Наши работы", href: "#portfolio" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contacts" },
];

const MagneticLink = ({ href, label }: { href: string; label: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
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
    <a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative font-display-stencil text-base font-normal tracking-[0.25em] text-doorium-platinum uppercase px-6 py-3 transition-colors duration-300 hover:text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
      style={{
        transform,
        transition: "transform 0.25s cubic-bezier(0.33, 1, 0.68, 1), color 0.3s",
      }}
    >
      {label}
      {/* Underline that grows from center */}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-3/4" />
    </a>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Logo — fixed top, independent of nav */}
      <a href="/" className="absolute top-0 -left-6 md:-left-4 z-[60] overflow-hidden">
        <img
          src={dooriumLogo}
          alt="Doorium Service"
          className="h-80 md:h-[28rem] w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] -mt-24 md:-mt-32"
        />
      </a>

      {/* Navigation bar — no container, bare magnetic links */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 md:px-10 py-5">
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <MagneticLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden text-doorium-platinum z-[60] ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden fixed top-20 left-4 right-4 rounded-2xl bg-doorium-jet/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display-stencil text-lg font-normal tracking-widest text-doorium-platinum/80 hover:text-primary hover:bg-white/10 transition-all uppercase px-4 py-3 rounded-xl"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
