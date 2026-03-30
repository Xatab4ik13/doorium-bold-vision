import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Политика конфиденциальности — Doorium Service";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(50 14% 5%)" }}>
      <Header />

      <section className="pt-40 pb-20 md:pt-48 md:pb-28 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">
            Документ
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-doorium-platinum leading-[0.95] tracking-wide mb-12">
            ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
          </h1>

          <div className="space-y-8 font-body text-sm text-doorium-platinum/70 leading-relaxed">
            <div>
              <p className="text-doorium-platinum/40 text-xs mb-4">
                Дата последнего обновления: 18 марта 2026 г.
              </p>
              <p>
                Настоящая Политика конфиденциальности персональных данных (далее — Политика) действует
                в отношении всей информации, которую в отношении всей информации, которую ИП Морозова А.А. (далее — Оператор),
                может получить о пользователе во время использования сайта doorium.ru (далее — Сайт).
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                1. ОПРЕДЕЛЕНИЕ ТЕРМИНОВ
              </h2>
              <p className="mb-2">
                <strong className="text-doorium-platinum/90">1.1. Персональные данные</strong> — любая информация,
                относящаяся прямо или косвенно к определённому или определяемому физическому лицу
                (субъекту персональных данных).
              </p>
              <p className="mb-2">
                <strong className="text-doorium-platinum/90">1.2. Обработка персональных данных</strong> — любое
                действие или совокупность действий, совершаемых с использованием средств автоматизации или
                без их использования с персональными данными, включая сбор, запись, систематизацию,
                накопление, хранение, уточнение (обновление, изменение), извлечение, использование,
                передачу (распространение, предоставление, доступ), обезличивание, блокирование,
                удаление, уничтожение.
              </p>
              <p>
                <strong className="text-doorium-platinum/90">1.3. Пользователь</strong> — любое лицо,
                имеющее доступ к Сайту посредством сети Интернет.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                2. ОБЩИЕ ПОЛОЖЕНИЯ
              </h2>
              <p className="mb-2">
                2.1. Использование Сайта означает согласие Пользователя с настоящей Политикой
                и условиями обработки персональных данных.
              </p>
              <p className="mb-2">
                2.2. В случае несогласия с условиями Политики Пользователь должен прекратить
                использование Сайта.
              </p>
              <p>
                2.3. Настоящая Политика применяется только к сайту doorium.ru. Оператор не контролирует
                и не несёт ответственности за сайты третьих лиц, на которые Пользователь может перейти
                по ссылкам, доступным на Сайте.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                3. СОСТАВ ПЕРСОНАЛЬНЫХ ДАННЫХ
              </h2>
              <p className="mb-2">
                3.1. Оператор может собирать следующие персональные данные Пользователя:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Фамилия, имя, отчество</li>
                <li>Номер телефона</li>
                <li>Адрес электронной почты</li>
                <li>Адрес для оказания услуг</li>
                <li>Город проживания</li>
                <li>Название компании (для партнёров)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                4. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ
              </h2>
              <p className="mb-2">
                4.1. Персональные данные обрабатываются в следующих целях:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Обработка входящих заявок на замер, монтаж и рекламацию</li>
                <li>Связь с Пользователем по вопросам оказания услуг</li>
                <li>Заключение и исполнение договоров на оказание услуг</li>
                <li>Направление уведомлений о статусе заявки</li>
                <li>Рассмотрение партнёрских заявок</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                5. ПОРЯДОК ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ
              </h2>
              <p className="mb-2">
                5.1. Оператор обязуется использовать персональные данные в соответствии
                с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
              </p>
              <p className="mb-2">
                5.2. Оператор принимает необходимые организационные и технические меры для защиты
                персональных данных от неправомерного или случайного доступа, уничтожения, изменения,
                блокирования, копирования, распространения, а также от иных неправомерных действий
                третьих лиц.
              </p>
              <p>
                5.3. Обработка персональных данных осуществляется с согласия субъекта персональных
                данных, выраженного путём заполнения формы на Сайте и отметки соответствующего
                чекбокса.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                6. ПЕРЕДАЧА ПЕРСОНАЛЬНЫХ ДАННЫХ ТРЕТЬИМ ЛИЦАМ
              </h2>
              <p className="mb-2">
                6.1. Оператор не передаёт персональные данные третьим лицам, за исключением случаев,
                предусмотренных законодательством Российской Федерации.
              </p>
              <p>
                6.2. Оператор вправе передавать персональные данные правоохранительным органам
                по основаниям, предусмотренным законодательством.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                7. СРОКИ ХРАНЕНИЯ ПЕРСОНАЛЬНЫХ ДАННЫХ
              </h2>
              <p>
                7.1. Персональные данные хранятся в течение срока, необходимого для достижения целей
                обработки, а также в течение сроков, установленных законодательством Российской
                Федерации. По истечении срока хранения персональные данные удаляются.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                8. ПРАВА СУБЪЕКТА ПЕРСОНАЛЬНЫХ ДАННЫХ
              </h2>
              <p className="mb-2">
                8.1. Пользователь имеет право:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Получать информацию об обработке своих персональных данных</li>
                <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
                <li>Отозвать согласие на обработку персональных данных, направив письменное
                  заявление на адрес электронной почты info@doorium.ru</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-doorium-platinum mb-3 tracking-wide">
                9. КОНТАКТНАЯ ИНФОРМАЦИЯ
              </h2>
              <p className="mb-2">
                По всем вопросам, связанным с обработкой персональных данных, Пользователь может
                обратиться к Оператору:
              </p>
              <ul className="space-y-1 ml-2">
                <li>Электронная почта: <a href="mailto:info@doorium.ru" className="text-primary hover:text-primary/80 transition-colors">info@doorium.ru</a></li>
                <li>Телефон: <a href="tel:+79168191996" className="text-primary hover:text-primary/80 transition-colors">+7 (916) 819-19-96</a></li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border/20">
              <p className="text-doorium-platinum/40 text-xs">
                ИП Морозова А.А. · ИНН 672207201188
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
