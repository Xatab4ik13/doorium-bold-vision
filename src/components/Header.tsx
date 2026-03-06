import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#portfolio" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contacts" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      {/* Liquid glass nav bar — centered */}
      <nav className="hidden md:flex items-center gap-1 px-2 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="font-body text-sm font-medium tracking-wide text-doorium-text-light/80 hover:text-doorium-gold hover:bg-white/10 transition-all duration-300 uppercase px-5 py-2 rounded-full"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Mobile burger */}
      <button
        className="md:hidden absolute top-4 right-4 text-doorium-text-light"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Меню"
      >
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-body text-base tracking-wider text-doorium-text-light/80 hover:text-doorium-gold hover:bg-white/10 transition-all uppercase px-4 py-3 rounded-xl"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
