import { useRef } from "react";

export function usePullToRefresh(_opts?: { onRefresh?: () => Promise<void> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return { containerRef, pullDistance: 0, refreshing: false };
}
