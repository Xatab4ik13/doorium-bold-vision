import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DoorOpen, Wrench, Ruler, CheckCircle2, Send } from "lucide-react";

const vacancies = [
  {
    icon: DoorOpen,
    title: "Монтажник межкомнатных дверей",
    requirements: [
      "Опыт установки межкомнатных дверей",
      "Умение качественно врезать фурнитуру",
      "Умение монтировать современные системы открывания и интерьерные перегородки",
      "Понимание технологий скрытого монтажа",
      "Наличие собственного профессионального инструмента",
      "Аккуратность и ответственность",
    ],
    note: "Работаем с современными интерьерными решениями — требуется уверенное знание технологий и аккуратное исполнение без переделок.",
  },
  {
    icon: Wrench,
    title: "Монтажник входных металлических дверей",
    requirements: [
      "Опыт установки входных металлических дверей",
      "Наличие собственного инструмента",
      "Наличие автомобиля (обязательно)",
      "Забор дверей со склада",
      "Умение менять панели",
      "Установка порталов",
    ],
    note: "Ответственность, самостоятельность и соблюдение стандартов монтажа обязательны.",
  },
  {
    icon: Ruler,
    title: "Замерщик дверных и интерьерных систем",
    requirements: [
      "Замер межкомнатных дверей",
      "Замер входных групп",
      "Замер плинтусов, стеновых панелей, перегородок",
      "Знание технических характеристик современных систем открывания и перегородок",
      "Умение работать с измерительным инструментом и нивелиром",
      "Грамотное общение с клиентами",
      "Ответственность за точность данных",
    ],
    note: null,
  },
];

const CareersPage = () => {
  useEffect(() => {
    document.title = "Вакансии — Doorium Service | Работа в сфере монтажа дверей";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      {/* Hero */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Карьера</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-doorium-platinum leading-[0.9] mb-6 tracking-wide">
            Требуются специалисты
          </h1>
          <p className="font-body text-base md:text-lg text-doorium-platinum/50 max-w-2xl mx-auto leading-relaxed">
            Компания Doorium Service приглашает к сотрудничеству профессионалов с опытом работы в Москве и Санкт-Петербурге
          </p>
        </div>
      </section>

      {/* Vacancies */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto space-y-6">
          {vacancies.map((v, i) => (
            <div
              key={i}
              className="rounded-xl p-8 md:p-10"
              style={{
                background: "linear-gradient(135deg, hsl(50 14% 12%) 0%, hsl(50 14% 8%) 100%)",
                boxShadow: "0 8px 32px -8px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-light text-doorium-platinum tracking-wide">
                  {v.title}
                </h2>
              </div>

              <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-4">Требования</p>
              <ul className="space-y-2.5 mb-6">
                {v.requirements.map((r, ri) => (
                  <li key={ri} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary/60 mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-doorium-platinum/60 leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>

              {v.note && (
                <div className="border-l-2 border-primary/30 pl-4 mt-6">
                  <p className="font-body text-sm text-doorium-platinum/40 italic leading-relaxed">{v.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-16 lg:px-24 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-base md:text-lg text-doorium-platinum/50 mb-8 leading-relaxed">
            Если вы профессионал и готовы к стабильной работе — будем рады сотрудничеству.<br />
            Свяжитесь с нами через раздел «Контакты» или отправьте информацию о себе удобным способом.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contacts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body text-sm font-medium tracking-[0.12em] uppercase hover:bg-primary/80 transition-colors rounded-sm"
            >
              Связаться с нами
            </Link>
            <a
              href="https://t.me/Doorium_service"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 border border-primary/30 text-doorium-platinum font-body text-sm font-medium tracking-[0.12em] uppercase hover:border-primary/60 transition-colors rounded-sm"
            >
              <Send size={14} /> Telegram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage;
