import dooriumLogo from "@/assets/doorium-logo-new.png";

const navLinks = [
  { label: "Услуги", href: "/services" },
  { label: "Наши работы", href: "/portfolio" },
  { label: "Контакты", href: "/contacts" },
];

const Footer = () => {
  return (
    <footer
      className="relative pt-32 md:pt-40 pb-10 px-8 md:px-16 lg:px-24"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, hsl(240 2% 90% / 0.08) 15%, hsl(240 2% 90% / 0.2) 30%, hsl(240 2% 90% / 0.45) 50%, hsl(240 2% 90% / 0.75) 70%, hsl(240 2% 90%) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-16">
          {/* Logo */}
          <a href="/" className="block">
            <img
              src={dooriumLogo}
              alt="Doorium Service"
              className="h-24 w-auto"
            />
          </a>

          {/* Nav */}
          <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display-stencil text-sm tracking-[0.2em] uppercase text-foreground/60 hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-foreground/10 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs tracking-wider text-foreground/40">
            © {new Date().getFullYear()} DOORIUM SERVICE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>
          <div className="flex gap-6">
            <a href="tel:+74951234567" className="font-body text-xs tracking-wider text-foreground/40 hover:text-primary transition-colors">
              +7 (495) 123-45-67
            </a>
            <a href="mailto:info@doorium.ru" className="font-body text-xs tracking-wider text-foreground/40 hover:text-primary transition-colors">
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
