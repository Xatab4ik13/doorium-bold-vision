import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navLinks = [
  { label: "Услуги", href: "/services" },
  { label: "Портфолио", href: "/portfolio" },
  { label: "Контакты", href: "/contacts" },
  { label: "Вакансии", href: "/careers" },
  { label: "Стать Партнёром", href: "/partner" },
];

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();

  return (
    <footer
      className="relative pt-16 md:pt-20 pb-6 px-8 md:px-16 lg:px-24"
      style={{
        background: "hsl(50 14% 5%)",
        borderTop: "1px solid hsl(34 24% 48% / 0.12)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-transparent border-none cursor-pointer p-0"
          >
            <img
              src={dooriumLogo}
              alt="Doorium Service"
              className="h-[6rem] md:h-[10rem] w-auto brightness-0 invert opacity-70 -my-6 md:-my-12"
            />
          </button>

          <nav className="flex flex-wrap gap-4 md:gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="font-body text-xs tracking-[0.15em] uppercase text-doorium-platinum/40 hover:text-primary transition-colors duration-300 bg-transparent border-none cursor-pointer p-0"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="h-px bg-doorium-platinum/10 mb-4" />

        {/* Contact info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            <div>
              <p className="font-body text-[10px] tracking-wider text-doorium-platinum/20 mb-0.5">Москва</p>
              <a href="tel:+79168191996" className="font-body text-xs tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors">
                8 (916) 819-19-96
              </a>
            </div>
            <div>
              <p className="font-body text-[10px] tracking-wider text-doorium-platinum/20 mb-0.5">Санкт-Петербург</p>
              <a href="tel:+79268637008" className="font-body text-xs tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors">
                +7 (926) 863-70-08
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@doorium.ru" className="font-body text-xs tracking-wider text-doorium-platinum/40 hover:text-primary transition-colors">
              info@doorium.ru
            </a>
            {/* Social */}
            <div className="flex gap-2">
              <a
                href="https://t.me/Doorium_service"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-doorium-platinum/10 flex items-center justify-center text-doorium-platinum/30 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Telegram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a
                href="https://max.ru/u/f9LHodD0cOJMEjKWRIkz2LvqUetirYd-JBWylARJJOTxfauqq9Q_PPRR9-4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-doorium-platinum/10 flex items-center justify-center text-doorium-platinum/30 hover:text-primary hover:bg-primary/10 transition-colors text-[10px] font-bold"
                aria-label="Max"
              >
                M
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-doorium-platinum/10 mb-4" />

        <p className="font-body text-[10px] tracking-wider text-doorium-platinum/25 text-center sm:text-left">
          © {new Date().getFullYear()} DOORIUM SERVICE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
