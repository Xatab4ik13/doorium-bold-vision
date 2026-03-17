import { useState, useEffect, useCallback, useMemo } from "react";
import { type ApiRequest } from "@/hooks/useRequests";
import { type FilterState } from "@/components/dashboard/RequestFilters";
import { demoRequests } from "@/data/demoData";

const DEFAULT_LIMIT = 30;

export interface PaginatedResponse {
  data: ApiRequest[];
  total: number;
  page: number;
  limit: number;
  counts?: Record<string, number>;
}

interface UsePaginatedRequestsOptions {
  limit?: number;
  quickFilter?: string;
}

export function usePaginatedRequests(filters: FilterState, options: UsePaginatedRequestsOptions = {}) {
  const { limit = DEFAULT_LIMIT, quickFilter } = options;
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filters.search, filters.status, filters.type, filters.measurerId, filters.installerId, filters.partnerId, filters.dateFrom, filters.dateTo, quickFilter]);

  const result = useMemo(() => {
    let filtered = [...demoRequests];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.client_name.toLowerCase().includes(s) ||
        r.number.toLowerCase().includes(s) ||
        (r.client_address || "").toLowerCase().includes(s) ||
        (r.client_phone || "").toLowerCase().includes(s)
      );
    }
    if (filters.status !== "all") filtered = filtered.filter(r => r.status === filters.status);
    if (filters.type !== "all") filtered = filtered.filter(r => r.type === filters.type);
    if (filters.city && filters.city !== "all") filtered = filtered.filter(r => (r.city || "") === filters.city);
    if (filters.measurerId !== "all") filtered = filtered.filter(r => r.measurer_id === filters.measurerId);
    if (filters.installerId !== "all") filtered = filtered.filter(r => r.installer_id === filters.installerId);
    if (filters.partnerId && filters.partnerId !== "all") filtered = filtered.filter(r => r.partner_id === filters.partnerId);
    if (filters.dateFrom) filtered = filtered.filter(r => (r.created_at?.split("T")[0] || "") >= filters.dateFrom);
    if (filters.dateTo) filtered = filtered.filter(r => (r.created_at?.split("T")[0] || "") <= filters.dateTo);

    if (quickFilter === "new") filtered = filtered.filter(r => r.status === "new");
    else if (quickFilter === "pending") filtered = filtered.filter(r => r.status === "pending");
    else if (quickFilter === "closed") filtered = filtered.filter(r => r.status === "closed");
    else if (quickFilter === "in_progress") filtered = filtered.filter(r => !["new", "closed", "cancelled"].includes(r.status));
    else if (quickFilter === "reclamation") filtered = filtered.filter(r => r.type === "reclamation");

    const counts: Record<string, number> = {
      all: demoRequests.length,
      new: demoRequests.filter(r => r.status === "new").length,
      in_progress: demoRequests.filter(r => !["new", "closed", "cancelled"].includes(r.status)).length,
      reclamation: demoRequests.filter(r => r.type === "reclamation").length,
    };

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return { data: paged, total, page, limit, counts };
  }, [filters, quickFilter, page, limit]);

  const totalPages = Math.max(1, Math.ceil(result.total / limit));

  return {
    requests: result.data,
    total: result.total,
    page,
    totalPages,
    limit,
    counts: result.counts,
    loading: false,
    setPage,
    refetch: useCallback(async () => {}, []),
  };
}
