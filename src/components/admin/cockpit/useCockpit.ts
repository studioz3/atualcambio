import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getClarityOverview,
  getCockpitInternal,
  getGa4Overview,
  getGa4Realtime,
  getIntegrationsStatus,
} from "@/lib/cockpit.functions";
import { rangeOf, type PeriodState } from "../PeriodFilter";

const day = 86400000;

function toDate(iso: string) {
  return iso.slice(0, 10);
}

/** Converte o filtro de período do painel em janelas comparáveis (atual x anterior). */
export function useRange(period: PeriodState) {
  return useMemo(() => {
    const r = rangeOf(period);
    const fromIso = r.from ?? new Date(Date.now() - 29 * day).toISOString();
    const toIso = r.to ?? new Date().toISOString();
    const span = Math.max(day, new Date(toIso).getTime() - new Date(fromIso).getTime());
    const prevTo = new Date(new Date(fromIso).getTime() - 1000).toISOString();
    const prevFrom = new Date(new Date(prevTo).getTime() - span).toISOString();
    const granularity: "hora" | "dia" | "semana" =
      span <= day * 1.5 ? "hora" : span > day * 70 ? "semana" : "dia";
    return {
      internal: { from: r.from, to: r.to, previousFrom: prevFrom, previousTo: prevTo },
      ga4: {
        from: toDate(fromIso),
        to: toDate(toIso),
        previousFrom: toDate(prevFrom),
        previousTo: toDate(prevTo),
        granularity,
      },
      granularity,
      isAllTime: period.preset === "tudo",
    };
  }, [period.preset, period.from, period.to]);
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["cockpit-integrations"],
    queryFn: () => getIntegrationsStatus(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInternal(period: PeriodState) {
  const range = useRange(period);
  return useQuery({
    queryKey: ["cockpit-internal", range.internal],
    queryFn: () => getCockpitInternal({ data: range.internal }),
    refetchInterval: 60_000,
  });
}

export function useGa4(period: PeriodState, enabled: boolean) {
  const range = useRange(period);
  return useQuery({
    queryKey: ["cockpit-ga4", range.ga4],
    queryFn: () => getGa4Overview({ data: range.ga4 }),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRealtime(enabled: boolean) {
  return useQuery({
    queryKey: ["cockpit-realtime"],
    queryFn: () => getGa4Realtime(),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useClarity(enabled: boolean) {
  return useQuery({
    queryKey: ["cockpit-clarity"],
    queryFn: () => getClarityOverview(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}

