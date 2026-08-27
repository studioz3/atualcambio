import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, ExternalLink, RefreshCw, Settings2, Zap } from "lucide-react";
import { CockpitCard, CockpitSkeleton } from "../cockpit/primitives";
import { getSocialAccounts, getSocialSyncRuns, saveSocialAccount } from "@/lib/social.functions";
import { startSocialOAuth } from "@/lib/social-oauth.functions";
import {
  groupLabel,
  platformDot,
  platformLabel,
  relativeTime,
  type AccountHealth,
  type SocialAccountStatus,
  type SocialSyncRun,
} from "@/lib/social-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/admin-shared";
import { cn } from "@/lib/utils";

/** Toda chamada de ação passa pelas rotas /api/admin — nada de API social no navegador. */
async function adminFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token ?? ""}` },
  });
  const body = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(body?.error ?? `Falha (${res.status})`);
  return body;
}

const healthStyles: Record<AccountHealth, { dot: string; text: string; icon: typeof CheckCircle2 }> = {
  verde: { dot: "bg-emerald-400", text: "text-emerald-400", icon: CheckCircle2 },
  amarelo: { dot: "bg-amber-400", text: "text-amber-400", icon: Clock },
  vermelho: { dot: "bg-rose-400", text: "text-rose-400", icon: AlertTriangle },
  cinza: { dot: "bg-white/30", text: "text-white/45", icon: CircleDashed },
};

function HealthPill({ account }: { account: SocialAccountStatus }) {
  const s = healthStyles[account.health];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", s.text)}>
      <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
      <Icon className="size-3.5" aria-hidden />
      {account.healthLabel}
    </span>
  );
}

function AccountBlock({ account }: { account: SocialAccountStatus }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState(account.handle ?? "");
  const [profileUrl, setProfileUrl] = useState(account.profileUrl ?? "");

  const save = useMutation({
    mutationFn: () =>
      saveSocialAccount({
        data: {
          platform: account.platform,
          handle: handle.trim() || null,
          profileUrl: profileUrl.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Perfil atualizado.");
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const test = useMutation({
    mutationFn: () => adminFetch(`/api/admin/social-test/${account.platform}`),
    onSuccess: (r: any) => {
      if (r?.ok === false) toast.error(r?.error ?? r?.message ?? "Conexão sem resposta válida.");
      else toast.success(`${platformLabel(account.platform)}: conexão respondendo.`);
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reconnect = useMutation({
    mutationFn: () => startSocialOAuth({ data: { platform: account.platform } }),
    onSuccess: (r) => {
      window.location.href = r.url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="size-2 rounded-full" style={{ background: platformDot(account.platform) }} aria-hidden />
            {platformLabel(account.platform)}
          </p>
          <p className="mt-1 truncate text-xs text-white/70">{account.displayName ?? "Conta não identificada"}</p>
          <p className="truncate text-xs text-white/45">
            {account.handle ?? "sem @ registrado"}
            {account.profileUrl ? (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-gold hover:underline"
              >
                abrir <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-white/45">
            Última sincronização: <span className="text-white/70">{relativeTime(account.lastSyncAt)}</span>
            {account.lastSyncAt ? ` · ${formatDateTime(account.lastSyncAt)}` : ""}
          </p>
        </div>
        <HealthPill account={account} />
      </div>

      {account.healthReason ? (
        <p
          className={cn(
            "mt-3 rounded-lg border px-3 py-2 text-[11px]",
            account.health === "vermelho"
              ? "border-rose-400/25 bg-rose-400/5 text-rose-200"
              : account.health === "amarelo"
                ? "border-amber-400/25 bg-amber-400/5 text-amber-200"
                : "border-white/10 text-white/45",
          )}
        >
          {account.healthReason}
        </p>
      ) : null}

      {account.lastRun?.note ? (
        <p className="mt-2 text-[11px] text-white/40">Nota do último run: {account.lastRun.note}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
          <Settings2 className="size-3.5" aria-hidden /> Configurar
        </Button>
        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white" onClick={() => test.mutate()} disabled={test.isPending}>
          <Zap className="size-3.5" aria-hidden /> {test.isPending ? "Testando…" : "Testar"}
        </Button>
        {account.canOauth ? (
          <Button size="sm" variant="ghost" className="text-white/70 hover:text-white" onClick={() => reconnect.mutate()} disabled={reconnect.isPending}>
            <RefreshCw className="size-3.5" aria-hidden /> {reconnect.isPending ? "Abrindo…" : "Reconectar"}
          </Button>
        ) : (
          <Button asChild size="sm" variant="ghost" className="text-white/70 hover:text-white">
            <Link to="/admin/social/spotify/importar">Importar CSV</Link>
          </Button>
        )}
      </div>

      {open ? (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-white/70">Perfil / @</Label>
              <Input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1" placeholder="@atualcambio" />
            </div>
            <div>
              <Label className="text-white/70">URL pública</Label>
              <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} className="mt-1" placeholder="https://" />
            </div>
          </div>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Salvando…" : "Salvar perfil"}
          </Button>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">O que falta para conectar</p>
            <ol className="mt-2 space-y-1 text-[11px] text-white/55">
              {account.requirements.map((r, i) => (
                <li key={r}>
                  {i + 1}. {r}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] text-white/40">
              Credenciais no servidor:{" "}
              {account.credentialsConfigured ? (
                <span className="text-emerald-400">configuradas</span>
              ) : (
                <span className="text-white/50">pendentes</span>
              )}
              . Tokens ficam apenas no servidor.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RunsTable({ runs }: { runs: SocialSyncRun[] }) {
  if (runs.length === 0) return <p className="text-sm text-white/45">Nenhuma execução registrada ainda.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="text-white/45">
          <tr>
            {["Data", "Rede", "Status", "Itens", "Erro / nota"].map((h) => (
              <th key={h} className="pb-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {runs.map((r) => (
            <tr key={r.id} className="align-top text-white/80">
              <td className="py-2.5 whitespace-nowrap">
                {formatDateTime(r.startedAt)}
                <span className="block text-[11px] text-white/35">{relativeTime(r.startedAt)}</span>
              </td>
              <td>{platformLabel(r.platform)}</td>
              <td>
                <span
                  className={cn(
                    "font-semibold",
                    r.status === "ok"
                      ? "text-emerald-400"
                      : r.status === "partial"
                        ? "text-amber-400"
                        : r.status === null
                          ? "text-white/40"
                          : "text-rose-400",
                  )}
                >
                  {r.status ?? "em andamento"}
                </span>
              </td>
              <td className="tabular-nums">{r.itemsSynced}</td>
              <td className="max-w-[320px] text-[11px]">
                {r.errorMessage ? (
                  <span className="text-rose-300">{r.errorMessage}</span>
                ) : r.note ? (
                  <span className="text-white/40">{r.note}</span>
                ) : (
                  <span className="text-white/25">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SocialConnections() {
  const qc = useQueryClient();
  const accounts = useQuery({ queryKey: ["social-accounts"], queryFn: () => getSocialAccounts() });
  const runs = useQuery({ queryKey: ["social-sync-runs"], queryFn: () => getSocialSyncRuns() });

  const sync = useMutation({
    mutationFn: () => adminFetch("/api/admin/social-sync", { method: "POST" }),
    onSuccess: () => {
      toast.success("Sincronização executada.");
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      qc.invalidateQueries({ queryKey: ["social-sync-runs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = (["meta", "linkedin", "tiktok", "youtube", "spotify"] as const).map((g) => ({
    group: g,
    accounts: (accounts.data ?? []).filter((a) => a.group === g),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-white/50">
          Os cards leem o que o sync gravou no banco. Nenhuma chamada às APIs sociais acontece no navegador.
        </p>
        <Button size="sm" onClick={() => sync.mutate()} disabled={sync.isPending}>
          <RefreshCw className={cn("size-3.5", sync.isPending && "motion-safe:animate-spin")} aria-hidden />
          {sync.isPending ? "Sincronizando…" : "Sincronizar agora"}
        </Button>
      </div>

      {accounts.isLoading ? <CockpitSkeleton rows={5} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {groups.map((g) => (
          <CockpitCard key={g.group} title={groupLabel[g.group]}>
            <div className="space-y-3">
              {g.accounts.map((a) => (
                <AccountBlock key={a.platform} account={a} />
              ))}
            </div>
          </CockpitCard>
        ))}
      </div>

      <CockpitCard
        title="Últimas sincronizações"
        subtitle="social_sync_runs — data, status, itens e erro real"
        action={
          <Button size="sm" variant="ghost" className="text-white/70 hover:text-white" onClick={() => runs.refetch()}>
            Atualizar
          </Button>
        }
      >
        {runs.isLoading ? <CockpitSkeleton rows={4} /> : <RunsTable runs={runs.data ?? []} />}
      </CockpitCard>
    </div>
  );
}
