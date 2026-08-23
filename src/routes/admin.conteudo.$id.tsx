import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const Route = createFileRoute("/admin/conteudo/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editar conteúdo | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Edição de conteúdo editorial da Atual Câmbio." },
    ],
  }),
  component: EditarConteudo,
});

function EditarConteudo() {
  const { id } = Route.useParams();
  return (
    <AdminShell title="Editar conteúdo">
      <ContentEditor id={id} />
    </AdminShell>
  );
}
