import { describe, expect, it } from "vitest";
import { getOverdueRequests } from "./OverdueRequestsCard";
import type { ApiRequest } from "@/hooks/useRequests";

const DAY = 86_400_000;
const madeDaysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const req = (over: Partial<ApiRequest>): ApiRequest =>
  ({
    id: "r1",
    number: "REQ-001",
    type: "installation",
    status: "date_agreed",
    client_name: "Иванов И. И.",
    created_at: madeDaysAgo(10),
    ...over,
  }) as ApiRequest;

describe("getOverdueRequests", () => {
  it("исключает заявки в статусе «В ожидании»", () => {
    const result = getOverdueRequests([
      req({ id: "p1", status: "pending" }),
      req({ id: "p2", status: "pending", type: "reclamation" }),
    ]);
    expect(result.map((r) => r.id)).toEqual([]);
  });

  it("учитывает монтажи и рекламации старше 5 дней", () => {
    const result = getOverdueRequests([
      req({ id: "i1", type: "installation", status: "date_agreed" }),
      req({ id: "r1", type: "reclamation", status: "new" }),
    ]);
    expect(result.map((r) => r.id)).toEqual(["i1", "r1"]);
  });

  it("не учитывает закрытые, отменённые, отказы и свежие заявки", () => {
    const result = getOverdueRequests([
      req({ id: "c1", status: "closed" }),
      req({ id: "c2", status: "cancelled" }),
      req({ id: "c3", status: "client_refused" }),
      req({ id: "f1", created_at: madeDaysAgo(2) }),
      req({ id: "m1", type: "measurement", status: "date_agreed" }),
    ]);
    expect(result).toEqual([]);
  });
});
