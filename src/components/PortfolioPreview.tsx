import { Link } from "react-router-dom";
import { FeatureCarousel } from "@/components/FeatureCarousel";

import work01 from "@/assets/portfolio/work-01.jpg";
import work02 from "@/assets/portfolio/work-02.jpg";
import work03 from "@/assets/portfolio/work-03.jpg";
import work04 from "@/assets/portfolio/work-04.jpg";
import work05 from "@/assets/portfolio/work-05.jpg";
import work06 from "@/assets/portfolio/work-06.jpg";
import work07 from "@/assets/portfolio/work-07.jpg";
import work08 from "@/assets/portfolio/work-08.jpg";
import work09 from "@/assets/portfolio/work-09.jpg";

const previewItems = [
  { src: work01, alt: "Работа 1" },
  { src: work02, alt: "Работа 2" },
  { src: work03, alt: "Работа 3" },
  { src: work04, alt: "Работа 4" },
  { src: work05, alt: "Работа 5" },
  { src: work06, alt: "Работа 6" },
  { src: work07, alt: "Работа 7" },
  { src: work08, alt: "Работа 8" },
  { src: work09, alt: "Работа 9" },
];

const PortfolioPreview = () => {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "hsl(50 14% 5%)" }}
    >
      <div className="text-center mb-10 md:mb-14 px-8">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Наши работы
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum tracking-wide">
          ПОРТФОЛИО
        </h2>
      </div>

      <FeatureCarousel images={previewItems} autoPlayInterval={4500} />

      <div className="text-center mt-10">
        <Link
          to="/portfolio"
          className="inline-block font-body text-sm font-medium tracking-[0.15em] uppercase px-8 py-4 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-sm"
        >
          Смотреть все работы
        </Link>
      </div>
    </section>
  );
};

export default PortfolioPreview;
