import { useNavigate } from "react-router-dom";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navLinks = [
  { label: "Услуги", href: "/services" },
  { label: "Наши работы", href: "/portfolio" },
  { label: "Контакты", href: "/contacts" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="relative pt-16 md:pt-20 pb-6 px-8 md:px-16 lg:px-24"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, hsl(240 2% 90% / 0.15) 30%, hsl(240 2% 90% / 0.5) 60%, hsl(240 2% 90%) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top row: logo + nav + contacts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <button onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-transparent border-none cursor-pointer p-0">
            <img src={dooriumLogo} alt="Doorium Service" className="h-14 w-auto" />
          </button>

          <nav className="flex flex-wrap gap-4 md:gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => { navigate(link.href); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="font-display-stencil text-xs tracking-[0.2em] uppercase text-foreground/50 hover:text-primary transition-colors duration-300 bg-transparent border-none cursor-pointer p-0"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-foreground/10 mb-4" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-body text-[10px] tracking-wider text-foreground/35">
            © {new Date().getFullYear()} DOORIUM SERVICE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>
          <div className="flex gap-4">
            <a href="tel:+74951234567" className="font-body text-[10px] tracking-wider text-foreground/35 hover:text-primary transition-colors">
              +7 (495) 123-45-67
            </a>
            <a href="mailto:info@doorium.ru" className="font-body text-[10px] tracking-wider text-foreground/35 hover:text-primary transition-colors">
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
