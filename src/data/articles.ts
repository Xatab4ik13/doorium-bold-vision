export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: string;
  date: string;
  readTime: string;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Как выбрать межкомнатные двери",
    slug: "kak-vybrat-mezhkomnatnye-dveri",
    excerpt: "Подробный гид по выбору межкомнатных дверей для вашего дома",
    image: "",
    content: "Полное руководство по выбору межкомнатных дверей...",
    date: "15 января 2026",
    readTime: "5 мин",
  },
  {
    id: "2",
    title: "Входные двери: безопасность и стиль",
    slug: "vhodnye-dveri-bezopasnost",
    excerpt: "На что обратить внимание при выборе входной двери",
    image: "",
    content: "Входная дверь — это первое, что видят гости...",
    date: "10 января 2026",
    readTime: "4 мин",
  },
  {
    id: "3",
    title: "Тренды дверной фурнитуры 2026",
    slug: "trendy-furnitury-2026",
    excerpt: "Актуальные тренды в мире дверной фурнитуры",
    image: "",
    content: "В 2026 году дверная фурнитура стала ещё более технологичной...",
    date: "5 января 2026",
    readTime: "3 мин",
  },
];
