import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/doorium-logo.jpg";

const navItems = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#portfolio" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contacts" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-doorium-dark/80 backdrop-blur-md border-b border-border/20">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="Doorium Service" className="h-12 w-auto" />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-body text-sm font-medium tracking-wide text-doorium-grey-light hover:text-doorium-gold transition-colors duration-300 uppercase"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Button className="bg-doorium-gold hover:bg-doorium-gold-light text-doorium-dark font-display text-sm tracking-wider px-6 uppercase">
            Оставить заявку
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-doorium-text-light"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-doorium-dark/95 backdrop-blur-lg border-t border-border/20">
          <nav className="container flex flex-col gap-6 py-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-lg tracking-wider text-doorium-grey-light hover:text-doorium-gold transition-colors uppercase"
              >
                {item.label}
              </a>
            ))}
            <Button className="bg-doorium-gold hover:bg-doorium-gold-light text-doorium-dark font-display tracking-wider uppercase w-full mt-2">
              Оставить заявку
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
