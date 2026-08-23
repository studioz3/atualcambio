import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cmsArchive, cmsDuplicate, cmsList, cmsSetStatus } from "@/lib/cms.functions";
import { cmsStatuses, cmsTipos } from "@/lib/cms-shared";
import { editorias, formatDate } from "@/content/editorial";
import { Copy, ExternalLink, Archive, Pencil, Plus } from "lucide-react";

const TODOS = "todos";

export function AdminContent() {
  const qc = useQueryClient();
  const [editoria, setEditoria] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [tipo, setTipo] = useState(TODOS);
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["cms-list", editoria, status, tipo, q],
    queryFn: () =>
      cmsList({
        data: {
          ...(editoria !== TODOS ? { editoria } : {}),
          ...(status !== TODOS ? { status } : {}),
          ...(tipo !== TODOS ? { tipo } : {}),
          ...(q.trim().length > 1 ? { q: q.trim() } : {}),
        },
      }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["cms-list"] });

  const publicar = useMutation({
    mutationFn: (vars: { id: string; status: "publicado" | "rascunho" }) =>
      cmsSetStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      refresh();
    },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const duplicar = useMutation({
    mutationFn: (id: string) => cmsDuplicate({ data: { id } }),
    onSuccess: () => {
      toast.success("Cópia criada como rascunho.");
      refresh();
    },
    onError: () => toast.error("Não foi possível duplicar."),
  });

  const arquivar = useMutation({
    mutationFn: (id: string) => cmsArchive({ data: { id } }),
    onSuccess: () => {
      toast.success("Conteúdo arquivado.");
      refresh();
    },
    onError: () => toast.error("Não foi possível arquivar."),
  });

  const rows = list.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por título"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-56"
        />
        <Select value={editoria} onValueChange={setEditoria}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Editoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas as editorias</SelectItem>
            {editorias.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os status</SelectItem>
            {cmsStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os tipos</SelectItem>
            {cmsTipos.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild className="ml-auto">
          <Link to="/admin/conteudo/novo">
            <Plus className="size-4" aria-hidden /> Novo conteúdo
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Editoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhum conteúdo encontrado com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[320px]">
                    <p className="truncate font-medium text-navy">{row.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /{row.editoria}/{row.slug}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{row.editoria}</TableCell>
                  <TableCell className="text-sm capitalize">{row.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "publicado" ? "default" : "secondary"}>
                      {cmsStatuses.find((s) => s.value === row.status)?.label ?? row.status}
                    </Badge>
                    {row.destaque_home ? (
                      <Badge variant="outline" className="ml-2">Home</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.published_at ? formatDate(row.published_at) : "—"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button asChild variant="ghost" size="sm" title="Editar">
                      <Link to="/admin/conteudo/$id" params={{ id: row.id }}>
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Duplicar"
                      onClick={() => duplicar.mutate(row.id)}
                    >
                      <Copy className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        publicar.mutate({
                          id: row.id,
                          status: row.status === "publicado" ? "rascunho" : "publicado",
                        })
                      }
                    >
                      {row.status === "publicado" ? "Despublicar" : "Publicar"}
                    </Button>
                    {row.status === "publicado" ? (
                      <Button asChild variant="ghost" size="sm" title="Ver no site">
                        <a
                          href={`/${row.editoria}/${row.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Arquivar"
                      onClick={() => arquivar.mutate(row.id)}
                    >
                      <Archive className="size-4" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
