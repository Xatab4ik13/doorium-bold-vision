import { useNavigate } from "react-router-dom";
import dooriumLogo from "@/assets/doorium-logo-new.png";

const navLinks = [
  { label: "Услуги", href: "/services" },
  { label: "Портфолио", href: "/portfolio" },
  { label: "Контакты", href: "/contacts" },
];

const Footer = () => {
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
              className="h-12 w-auto brightness-0 invert opacity-70"
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-body text-[10px] tracking-wider text-doorium-platinum/25">
            © {new Date().getFullYear()} DOORIUM SERVICE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>
          <div className="flex gap-4">
            <a
              href="tel:+74951234567"
              className="font-body text-[10px] tracking-wider text-doorium-platinum/25 hover:text-primary transition-colors"
            >
              +7 (495) 123-45-67
            </a>
            <a
              href="mailto:info@doorium.ru"
              className="font-body text-[10px] tracking-wider text-doorium-platinum/25 hover:text-primary transition-colors"
            >
              info@doorium.ru
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
