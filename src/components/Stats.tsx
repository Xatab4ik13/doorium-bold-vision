import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 19, suffix: "", label: "ЛЕТ ОПЫТА", desc: "Работаем с 2007 года" },
  { value: 35, suffix: "", label: "БРИГАД", desc: "Команда профессионалов" },
  { value: 8, suffix: "", label: "ЗАМЕРЩИКОВ", desc: "Точные замеры" },
  { value: 182400, suffix: "+", label: "УСТАНОВЛЕННЫХ ДВЕРЕЙ", desc: "Реализовано проектов" },
];

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);
  return count;
}

const formatNumber = (n: number) => n.toLocaleString("ru-RU");

const RingStat = ({ stat, index }: { stat: typeof stats[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(stat.value, visible, stat.value > 1000 ? 2500 : 2000);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Ring animation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = visible ? 1 : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s ease-out ${index * 0.15}s, transform 0.8s ease-out ${index * 0.15}s`,
      }}
    >
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            opacity="0.3"
          />
          {/* Animated ring */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: `stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`,
            }}
          />
        </svg>
        {/* Number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl md:text-4xl text-doorium-platinum tracking-tight">
            {formatNumber(count)}{stat.suffix}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display text-xs md:text-sm tracking-[0.2em] text-primary">
          {stat.label}
        </p>
        <p className="font-body text-xs text-muted-foreground mt-1">
          {stat.desc}
        </p>
      </div>
    </div>
  );
};

const Stats = () => {
  return (
    <section
      id="stats"
      className="relative py-24 md:py-32"
      style={{
        background: "linear-gradient(to bottom, hsl(50 14% 8%) 0%, hsl(50 14% 8%) 20%, hsl(53 10% 11%) 35%, hsl(60 8% 13%) 50%, hsl(70 7% 16%) 65%, hsl(70 7% 16%) 100%)",
      }}
    >
      <div className="relative z-10 px-8 md:px-16 lg:px-24 mb-16 md:mb-20">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
          Почему мы
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum leading-[0.95] tracking-wide">
          НАШИ ПОКАЗАТЕЛИ
        </h2>
      </div>

      <div className="relative z-10 px-8 md:px-16 lg:px-24 grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
        {stats.map((stat, i) => (
          <RingStat key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
};

export default Stats;
