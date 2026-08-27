import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { CockpitCard, CockpitSkeleton } from "./cockpit/primitives";
import { getSocialAccounts, saveSocialAccount } from "@/lib/social.functions";
import { useIntegrations } from "./cockpit/useCockpit";
import { platformLabel } from "@/lib/social-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/admin-shared";

function StatusPill({ status }: { status: string }) {
  if (status === "conectado")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <CheckCircle2 className="size-3.5" aria-hidden /> Conectado
      </span>
    );
  if (status === "erro")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
        <CircleAlert className="size-3.5" aria-hidden /> Erro
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40">
      <CircleDashed className="size-3.5" aria-hidden /> Não conectado
    </span>
  );
}

function AccountCard({
  account,
}: {
  account: {
    platform: string;
    handle: string | null;
    profileUrl: string | null;
    status: string;
    lastSyncAt: string | null;
    lastError: string | null;
    credentialsConfigured: boolean;
    requirements: string[];
  };
}) {
  const qc = useQueryClient();
  const [handle, setHandle] = useState(account.handle ?? "");
  const [profileUrl, setProfileUrl] = useState(account.profileUrl ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      saveSocialAccount({
        data: { platform: account.platform, handle: handle.trim() || null, profileUrl: profileUrl.trim() || null },
      }),
    onSuccess: () => {
      toast.success("Perfil atualizado.");
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CockpitCard
      title={platformLabel(account.platform)}
      subtitle={
        account.lastSyncAt ? `Última sincronização: ${formatDateTime(account.lastSyncAt)}` : "Nunca sincronizado"
      }
      action={<StatusPill status={account.status} />}
    >
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
      <Button size="sm" className="mt-3" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando…" : "Salvar perfil"}
      </Button>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        {account.status === "conectado" ? (
          <p className="text-[11px] text-white/55">
            Integração concluída. Tokens ficam apenas no servidor e nunca aparecem no painel.
          </p>
        ) : (
          <>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
              O que falta para conectar
            </p>
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
              . Tokens ficam apenas no servidor e nunca aparecem no painel.
            </p>
          </>
        )}
        {account.lastError ? (
          <p className="mt-2 text-[11px] text-rose-300">Último erro: {account.lastError}</p>
        ) : null}
        {account.platform === "spotify" ? (
          <Link
            to="/admin/social/spotify/importar"
            className="mt-2 inline-block text-[11px] font-semibold text-gold hover:underline"
          >
            Ir para a importação de CSV
          </Link>
        ) : null}
      </div>
    </CockpitCard>
  );
}

export function SocialIntegrations() {
  const accounts = useQuery({ queryKey: ["social-accounts"], queryFn: () => getSocialAccounts() });
  const analytics = useIntegrations();

  return (
    <div className="space-y-6">
      <CockpitCard title="Analytics do site" subtitle="Fontes que alimentam tráfego, comportamento e funil">
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80">
            Google Analytics 4 <StatusPill status={analytics.data?.ga4 ? "conectado" : "nao_conectado"} />
          </li>
          <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80">
            Microsoft Clarity <StatusPill status={analytics.data?.clarity ? "conectado" : "nao_conectado"} />
          </li>
        </ul>
        <Link
          to="/admin/analytics/health"
          className="mt-3 inline-block text-xs font-semibold text-gold hover:underline"
        >
          Ver monitor de saúde das integrações
        </Link>
      </CockpitCard>

      <CockpitCard
        title="Conexões das redes sociais"
        subtitle="Semáforo por plataforma, erros reais do último sync e histórico de execuções"
      >
        <Link
          to="/admin/integracoes/social"
          className="inline-block text-xs font-semibold text-gold hover:underline"
        >
          Abrir painel de conexões e últimas sincronizações
        </Link>
      </CockpitCard>

      {accounts.isLoading ? <CockpitSkeleton rows={4} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {(accounts.data ?? []).map((a) => (
          <AccountCard key={a.platform} account={a} />
        ))}
      </div>
    </div>
  );
}
