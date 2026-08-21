import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LeadDrawer } from "./LeadDrawer";
import type { LeadIntentId } from "@/lib/lead-intents";

type LeadOptions = {
  intent?: LeadIntentId | undefined;
  context?: string | undefined;
  profile?: "pf" | "pj" | undefined;
};

type LeadContextValue = {
  openLead: (options?: LeadOptions) => void;
};

const LeadContext = createContext<LeadContextValue>({ openLead: () => {} });

export function useLead() {
  return useContext(LeadContext);
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LeadOptions>({});

  const openLead = useCallback((next: LeadOptions = {}) => {
    setOptions(next);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openLead }), [openLead]);

  return (
    <LeadContext.Provider value={value}>
      {children}
      <LeadDrawer
        open={open}
        onOpenChange={setOpen}
        intentId={options.intent}
        context={options.context}
        initialProfile={options.profile}
      />
    </LeadContext.Provider>
  );
}
