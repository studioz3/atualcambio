import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CONTENT_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { listSubscribers } from "@/lib/admin.functions";
import { formatDateTime } from "@/lib/admin-shared";

export const Route = createFileRoute("/admin/newsletter")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Newsletter | Painel Atual Câmbio" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Inscritos da newsletter — área interna." },
    ],
  }),
  component: NewsletterPage,
});

function NewsletterPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: () => listSubscribers({ data: {} }),
    retry: false,
  });
  const subs = data?.subscribers ?? [];

  return (
    <AdminShell requiredRoles={CONTENT_ROLES} title="Newsletter">
      <p className="text-sm text-muted-foreground">
        Inscritos são mantidos separados dos leads comerciais e não entram no funil.
      </p>
      {error ? <p className="mt-4 text-sm text-destructive">Não foi possível carregar os inscritos.</p> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-offwhite text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Editorias</th>
              <th className="px-4 py-3">Origem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Carregando…</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhum inscrito ainda.</td></tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(s.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-navy">{s.nome}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[
                      s.momento_atual ? "Momento Atual" : null,
                      s.cripto_wine ? "Cripto Wine" : null,
                      s.vida_atual ? "Vida Atual" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.origem ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
