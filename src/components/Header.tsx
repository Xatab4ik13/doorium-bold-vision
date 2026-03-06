import { useState } from "react";
import { Menu, X } from "lucide-react";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navItems = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#portfolio" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contacts" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Logo — fixed top, independent of nav */}
      <a href="/" className="fixed top-0 -left-6 md:-left-4 z-[60] overflow-hidden">
        <img
          src={dooriumLogo}
          alt="Doorium Service"
          className="h-80 md:h-[28rem] w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] -mt-24 md:-mt-32"
        />
      </a>

      {/* Navigation bar — separate from logo */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 md:px-10 py-4">
        {/* Liquid glass nav — right-aligned on desktop */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display-stencil text-sm font-normal tracking-widest text-doorium-platinum/80 hover:text-primary hover:bg-white/10 transition-all duration-300 uppercase px-5 py-2 rounded-xl"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden text-doorium-platinum z-[60]"
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
