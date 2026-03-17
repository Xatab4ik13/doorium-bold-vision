import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Clock, ChevronRight, Send } from "lucide-react";

const vacancies = [
  {
    title: "Мастер по установке межкомнатных дверей",
    location: "Москва",
    type: "Полная занятость",
    salary: "от 120 000 ₽",
    description: "Опыт установки дверей от 2 лет. Знание всех типов конструкций: распашные, раздвижные, скрытого монтажа, INVISIBLE. Аккуратность, пунктуальность, наличие собственного инструмента.",
    requirements: [
      "Опыт монтажа дверей от 2 лет",
      "Знание всех типов конструкций",
      "Наличие собственного инструмента",
      "Аккуратность и пунктуальность",
    ],
  },
  {
    title: "Мастер по установке входных дверей",
    location: "Москва",
    type: "Полная занятость",
    salary: "от 100 000 ₽",
    description: "Установка металлических входных дверей, демонтаж, расширение проёмов. Опыт работы с термодверями и электронными замками приветствуется.",
    requirements: [
      "Опыт работы от 1 года",
      "Умение работать с металлоконструкциями",
      "Знание технологий тёплого монтажа",
      "Водительское удостоверение (желательно)",
    ],
  },
  {
    title: "Замерщик",
    location: "Москва / Санкт-Петербург",
    type: "Полная занятость",
    salary: "от 80 000 ₽",
    description: "Выезд на объекты для замера дверных проёмов. Составление технического задания. Консультирование клиентов по техническим вопросам.",
    requirements: [
      "Опыт замеров от 1 года",
      "Знание типов дверных конструкций",
      "Коммуникабельность",
      "Наличие автомобиля",
    ],
  },
  {
    title: "Мастер по установке межкомнатных дверей",
    location: "Санкт-Петербург",
    type: "Полная занятость",
    salary: "от 110 000 ₽",
    description: "Аналогичная позиция для филиала в Санкт-Петербурге. Все типы межкомнатных дверей и раздвижных систем.",
    requirements: [
      "Опыт монтажа дверей от 2 лет",
      "Готовность к выездам за КАД",
      "Наличие собственного инструмента",
      "Ответственность и аккуратность",
    ],
  },
];

const benefits = [
  { title: "Стабильный доход", desc: "Постоянный поток заказов, своевременные выплаты" },
  { title: "Гибкий график", desc: "Возможность планировать рабочий день" },
  { title: "Профессиональный рост", desc: "Обучение новым технологиям монтажа" },
  { title: "Поддержка", desc: "Персональный менеджер и техническая помощь" },
];

const CareersPage = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Вакансии — Doorium Service | Работа в сфере монтажа дверей";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero — clean, no photo */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Карьера</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-doorium-platinum leading-[0.9] mb-6 tracking-wide">
            ВАКАНСИИ
          </h1>
          <p className="font-body text-lg md:text-xl text-doorium-platinum/60 max-w-2xl leading-relaxed">
            Присоединяйтесь к команде профессионалов с 20-летним опытом монтажа дверей
          </p>
          <div className="w-16 h-[2px] bg-primary mt-8" />
        </div>
      </section>

      {/* Benefits */}
      <section className="px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum mb-10 tracking-wide">
            Почему с нами
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="border border-border/20 rounded-lg p-6 hover:border-primary/40 transition-colors duration-500">
                <h3 className="font-display text-lg text-doorium-platinum mb-2 tracking-wide">{b.title}</h3>
                <p className="font-body text-sm text-doorium-platinum/50 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vacancies list */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-doorium-platinum mb-10 tracking-wide">
            Открытые позиции
          </h2>
          <div className="space-y-4">
            {vacancies.map((v, i) => (
              <div key={i} className="border border-border/20 rounded-lg overflow-hidden hover:border-primary/30 transition-colors duration-500">
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 bg-transparent"
                >
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-doorium-platinum tracking-wide mb-2">{v.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-doorium-platinum/50 font-body">
                        <MapPin size={14} className="text-primary" /> {v.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-doorium-platinum/50 font-body">
                        <Clock size={14} className="text-primary" /> {v.type}
                      </span>
                      <span className="flex items-center gap-1.5 text-primary font-body font-medium">
                        {v.salary}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-doorium-platinum/30 transition-transform duration-300 shrink-0 ${expandedIdx === i ? "rotate-90" : ""}`}
                  />
                </button>
                {expandedIdx === i && (
                  <div className="px-6 pb-6 border-t border-border/10 pt-4">
                    <p className="font-body text-sm text-doorium-platinum/60 leading-relaxed mb-4">{v.description}</p>
                    <h4 className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-3">Требования</h4>
                    <ul className="space-y-1.5 mb-6">
                      {v.requirements.map((r, ri) => (
                        <li key={ri} className="font-body text-sm text-doorium-platinum/50 flex items-start gap-2">
                          <span className="text-primary mt-1">•</span> {r}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="https://t.me/Doorium_service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-sm font-medium tracking-[0.1em] uppercase hover:bg-primary/80 transition-colors rounded-sm"
                    >
                      <Send size={14} /> Откликнуться
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage;
