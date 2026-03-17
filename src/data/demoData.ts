import type { ApiRequest, ApiUser } from "@/hooks/useRequests";

export const demoUsers: ApiUser[] = [
  { id: "u1", name: "Сидоров К.В.", role: "measurer", phone: "+7 900 111 11 11", active: true },
  { id: "u2", name: "Козлов А.П.", role: "measurer", phone: "+7 900 222 22 22", active: true },
  { id: "u3", name: "Новиков Д.С.", role: "installer", phone: "+7 900 333 33 33", active: true },
  { id: "u4", name: "Фёдоров М.И.", role: "installer", phone: "+7 900 444 44 44", active: true },
  { id: "u5", name: "Морозова Е.А.", role: "manager", phone: "+7 900 555 55 55", active: true },
  { id: "u6", name: "Волков Р.О.", role: "manager", phone: "+7 900 666 66 66", active: true },
  { id: "u7", name: "Партнёр Двери-Люкс", role: "partner", phone: "+7 900 777 77 77", active: true },
  { id: "u8", name: "Партнёр Строй-Маркет", role: "partner", phone: "+7 900 888 88 88", active: true },
  { id: "u9", name: "Лебедев И.К.", role: "installer", phone: "+7 900 999 99 99", active: false },
];

export const demoRequests: ApiRequest[] = [
  { id: "r1", number: "REQ-001", type: "measurement", status: "new", client_name: "Иванов Иван Иванович", client_phone: "+7 900 111 22 33", client_address: "ул. Ленина, 15, кв. 42", city: "Москва", work_description: "Замер межкомнатных дверей, 3 проёма", source: "site", interior_doors: 3, created_at: "2026-03-17T10:00:00Z" },
  { id: "r2", number: "REQ-002", type: "measurement", status: "measurer_assigned", client_name: "Петрова Анна Сергеевна", client_phone: "+7 900 222 33 44", client_address: "пр. Мира, 88, кв. 7", city: "Москва", work_description: "Замер входной двери", source: "partner", partner_id: "u7", measurer_id: "u1", interior_doors: 0, entrance_doors: 1, created_at: "2026-03-16T09:30:00Z" },
  { id: "r3", number: "REQ-003", type: "measurement", status: "date_agreed", client_name: "Лебедев Виктор Геннадьевич", client_phone: "+7 900 999 00 11", client_address: "пр. Космонавтов, 55, кв. 17", city: "СПб", work_description: "Замер входной и 2 межкомнатных дверей", source: "site", measurer_id: "u2", agreed_date: "2026-03-20T14:00:00Z", interior_doors: 2, entrance_doors: 1, created_at: "2026-03-15T14:00:00Z" },
  { id: "r4", number: "REQ-004", type: "installation", status: "new", client_name: "Егорова Татьяна Леонидовна", client_phone: "+7 900 000 11 22", client_address: "ул. Центральная, 1, кв. 99", city: "Москва", work_description: "Монтаж 3 межкомнатных дверей", source: "site", interior_doors: 3, created_at: "2026-03-15T11:00:00Z" },
  { id: "r5", number: "REQ-005", type: "installation", status: "date_agreed", client_name: "Михайлова Елена Владимировна", client_phone: "+7 900 444 55 66", client_address: "ул. Пушкина, 22, кв. 5", city: "Москва", work_description: "Монтаж входной двери с электрозамком", source: "partner", partner_id: "u8", installer_id: "u3", agreed_date: "2026-03-21T10:00:00Z", entrance_doors: 1, created_at: "2026-03-14T08:00:00Z" },
  { id: "r6", number: "REQ-006", type: "reclamation", status: "new", client_name: "Волкова Марина Игоревна", client_phone: "+7 900 666 77 88", client_address: "ул. Советская, 44, кв. 12", city: "СПб", work_description: "Скрипит дверь после монтажа", source: "site", created_at: "2026-03-14T16:00:00Z" },
  { id: "r7", number: "REQ-007", type: "measurement", status: "closed", client_name: "Кузнецов Павел Петрович", client_phone: "+7 900 777 88 99", client_address: "ул. Лесная, 7, кв. 2", city: "Москва", work_description: "Замер для 5 межкомнатных дверей", source: "site", measurer_id: "u1", interior_doors: 5, closed_at: "2026-03-12T18:00:00Z", created_at: "2026-03-10T09:00:00Z", updated_at: "2026-03-12T18:00:00Z" },
  { id: "r8", number: "REQ-008", type: "installation", status: "closed", client_name: "Новиков Алексей Александрович", client_phone: "+7 900 555 66 77", client_address: "пр. Победы, 10, кв. 33", city: "Москва", work_description: "Монтаж 4 межкомнатных дверей", source: "partner", partner_id: "u7", installer_id: "u3", interior_doors: 4, amount: 48000, closed_at: "2026-03-11T17:00:00Z", created_at: "2026-03-08T10:00:00Z", updated_at: "2026-03-11T17:00:00Z" },
  { id: "r9", number: "REQ-009", type: "measurement", status: "pending", client_name: "Соколова Наталья Романовна", client_phone: "+7 900 888 99 00", client_address: "ул. Парковая, 19, кв. 8", city: "Москва", work_description: "Замер 2 дверей с фрамугой", source: "site", interior_doors: 2, created_at: "2026-03-12T12:00:00Z" },
  { id: "r10", number: "REQ-010", type: "measurement", status: "measurement_done", client_name: "Козлов Дмитрий Михайлович", client_phone: "+7 900 333 44 55", client_address: "ул. Гагарина, 3, кв. 101", city: "СПб", work_description: "Замер для перегородки", source: "site", measurer_id: "u2", partitions: 1, created_at: "2026-03-11T15:00:00Z", updated_at: "2026-03-14T16:00:00Z" },
  { id: "r11", number: "REQ-011", type: "installation", status: "pending", client_name: "Андреев Сергей Борисович", client_phone: "+7 900 112 23 34", client_address: "ул. Садовая, 33, кв. 4", city: "Москва", work_description: "Монтаж 2 межкомнатных дверей", source: "site", interior_doors: 2, created_at: "2026-03-13T09:00:00Z" },
  { id: "r12", number: "REQ-012", type: "measurement", status: "new", client_name: "Белова Ольга Петровна", client_phone: "+7 900 223 34 45", client_address: "ул. Зелёная, 12, кв. 56", city: "Москва", work_description: "Замер межкомнатных дверей, 4 проёма", source: "partner", partner_id: "u8", interior_doors: 4, created_at: "2026-03-17T08:00:00Z" },
];

export const demoPartnerForms = [
  { id: 1, name: "Петров Василий Андреевич", store_name: "Двери-Люкс", store_address: "г. Москва, ул. Торговая, 5", phone: "+7 900 100 20 30", email: "petrov@dveri-lux.ru", status: "new", notes: null, created_at: "2026-03-16T10:30:00Z" },
  { id: 2, name: "Сидорова Мария Ивановна", store_name: "Строй-Маркет", store_address: "г. СПб, пр. Невский, 100", phone: "+7 900 200 30 40", email: "sidorova@stroymarket.ru", status: "in_progress", notes: "Обсуждаем условия", created_at: "2026-03-14T14:00:00Z" },
  { id: 3, name: "Козлов Андрей Сергеевич", store_name: "ДверьОпт", store_address: "г. Москва, ул. Складская, 88", phone: "+7 900 300 40 50", email: "kozlov@dveropt.ru", status: "done", notes: "Аккаунт создан", created_at: "2026-03-10T09:00:00Z" },
];

export const demoArticles = [
  { id: "a1", title: "Как выбрать межкомнатную дверь", slug: "kak-vybrat-mezhkomnatnuyu-dver", excerpt: "Советы по выбору идеальной двери для вашего интерьера", image: "", content: "Полный текст статьи...", date: "15 марта 2026", readTime: "5 мин" },
  { id: "a2", title: "Входные двери: что важно знать", slug: "vhodnye-dveri-chto-vazhno-znat", excerpt: "Обзор материалов и замков для входных дверей", image: "", content: "Полный текст статьи...", date: "12 марта 2026", readTime: "7 мин" },
  { id: "a3", title: "Тренды дверей 2026 года", slug: "trendy-dverey-2026", excerpt: "Минимализм, скрытые петли и новые текстуры", image: "", content: "Полный текст статьи...", date: "10 марта 2026", readTime: "4 мин" },
];

// Helper: get user name by id
export function getDemoUserName(id?: string): string | undefined {
  if (!id) return undefined;
  return demoUsers.find(u => u.id === id)?.name;
}

export function getDemoUsersByRole(role: string): ApiUser[] {
  return demoUsers.filter(u => u.role === role && u.active);
}
