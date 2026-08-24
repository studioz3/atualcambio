import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cmsArchive, cmsDuplicate, cmsList, cmsSetStatus } from "@/lib/cms.functions";
import { cmsStatuses, cmsFormatos, formatoLabel } from "@/lib/cms-shared";
import { editorialsList } from "@/lib/editorials.functions";
import { formatDate } from "@/content/editorial";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Tags } from "lucide-react";

const TODOS = "todos";

export function AdminContent() {
  const qc = useQueryClient();
  const [formatoTab, setFormatoTab] = useState(TODOS);
  const [editoria, setEditoria] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [formato, setFormato] = useState(TODOS);
  const [q, setQ] = useState("");

  const editoriasQuery = useQuery({ queryKey: ["editorials"], queryFn: () => editorialsList() });
  const editorias = editoriasQuery.data ?? [];

  const formatoAtivo = formatoTab !== TODOS ? formatoTab : formato !== TODOS ? formato : null;

  const list = useQuery({
    queryKey: ["cms-list", editoria, status, formatoAtivo, q],
    queryFn: () =>
      cmsList({
        data: {
          ...(editoria !== TODOS ? { editoria } : {}),
          ...(status !== TODOS ? { status } : {}),
          ...(formatoAtivo ? { tipo: formatoAtivo } : {}),
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

  const editoriaNome = (slug: string) =>
    editorias.find((e) => e.slug === slug)?.name ?? slug;

  const rows = list.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={formatoTab} onValueChange={setFormatoTab}>
          <TabsList>
            <TabsTrigger value={TODOS}>Todos</TabsTrigger>
            <TabsTrigger value="artigo">Artigos</TabsTrigger>
            <TabsTrigger value="podcast">Podcasts</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/admin/editorias">
              <Tags className="size-4" aria-hidden /> Gerenciar editorias
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/conteudo/novo">
              <Plus className="size-4" aria-hidden /> Novo conteúdo
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por título"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-56"
        />
        <Select value={editoria} onValueChange={setEditoria}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Editoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas as editorias</SelectItem>
            {editorias.map((e) => (
              <SelectItem key={e.id} value={e.slug}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={formato} onValueChange={setFormato} disabled={formatoTab !== TODOS}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Formato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os formatos</SelectItem>
            {cmsFormatos.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os status</SelectItem>
            {cmsStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Editoria</TableHead>
              <TableHead>Formato</TableHead>
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
                  <TableCell className="text-sm">{editoriaNome(row.editoria)}</TableCell>
                  <TableCell className="text-sm">{formatoLabel(row.tipo)}</TableCell>
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
                    {row.status === "publicado" ? (
                      <Button asChild variant="ghost" size="sm" title="Abrir no site">
                        <a
                          href={`/${row.editoria}/${row.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                      </Button>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" title="Mais ações">
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => duplicar.mutate(row.id)}>
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            publicar.mutate({
                              id: row.id,
                              status: row.status === "publicado" ? "rascunho" : "publicado",
                            })
                          }
                        >
                          {row.status === "publicado" ? "Despublicar" : "Publicar"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Arquivar "${row.titulo}"?`)) arquivar.mutate(row.id);
                          }}
                        >
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
