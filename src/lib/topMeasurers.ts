import type { ApiRequest } from "@/hooks/useRequests";

export function computeTopMeasurers(
  requests: ApiRequest[],
  getUserName: (id?: string) => string | undefined,
) {
  const counts = new Map<string, { name: string; role: string; completed: number }>();
  for (const request of requests) {
    if (request.type !== "measurement" || !["measurement_done", "closed"].includes(request.status)) continue;
    const id = request.measurer_id;
    if (!id) continue;
    const entry = counts.get(id) || { name: getUserName(id) || id, role: "Замерщик", completed: 0 };
    entry.completed += 1;
    counts.set(id, entry);
  }
  return [...counts.values()].sort((a, b) => b.completed - a.completed).slice(0, 5);
}