import { useState, useEffect, useCallback } from "react";
import { type ApiRequest } from "@/hooks/useRequests";
import { type FilterState } from "@/components/dashboard/RequestFilters";
import api from "@/lib/api";

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
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0, new: 0, in_progress: 0, reclamation: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(1); }, [filters.search, filters.status, filters.type, filters.measurerId, filters.installerId, filters.partnerId, filters.dateFrom, filters.dateTo, quickFilter]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.city && filters.city !== "all") params.set("city", filters.city);
      if (filters.measurerId !== "all") params.set("measurer_id", filters.measurerId);
      if (filters.installerId !== "all") params.set("installer_id", filters.installerId);
      if (filters.partnerId && filters.partnerId !== "all") params.set("partner_id", filters.partnerId);
      if (filters.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters.dateTo) params.set("date_to", filters.dateTo);
      if (quickFilter && quickFilter !== "all") params.set("quick", quickFilter);

      const response = await api(`/api/requests?${params.toString()}`, { auth: true });
      const data = Array.isArray(response) ? response : response.data || [];
      const responseTotal = response.total ?? data.length;

      setRequests(data);
      setTotal(responseTotal);

      // Calculate counts from full dataset if not provided by backend
      if (response.counts) {
        setCounts(response.counts);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, quickFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    requests,
    total,
    page,
    totalPages,
    limit,
    counts,
    loading,
    setPage,
    refetch: fetchData,
  };
}
