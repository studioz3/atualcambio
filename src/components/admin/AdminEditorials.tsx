import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  editorialDelete,
  editorialSetStatus,
  editorialTransfer,
  editorialsList,
} from "@/lib/editorials.functions";
import type { Editorial, EditorialWithCount } from "@/lib/editorials-shared";
import { EditorialDialog } from "./EditorialDialog";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

export function AdminEditorials() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Editorial | null>(null);
  const [transferFrom, setTransferFrom] = useState<EditorialWithCount | null>(null);
  const [transferTo, setTransferTo] = useState<string>("");

  const query = useQuery({ queryKey: ["editorials"], queryFn: () => editorialsList() });
  const rows = query.data ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["editorials"] });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "ativa" | "inativa" }) =>
      editorialSetStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status da editoria atualizado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => editorialDelete({ data: { id } }),
    onSuccess: () => {
      toast.success("Editoria excluída.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const transfer = useMutation({
    mutationFn: (vars: { from: string; to: string }) => editorialTransfer({ data: vars }),
    onSuccess: () => {
      toast.success("Conteúdos transferidos.");
      setTransferFrom(null);
      setTransferTo("");
      refresh();
      qc.invalidateQueries({ queryKey: ["cms-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/admin/conteudo">
            <ArrowLeft className="size-4" aria-hidden /> Conteúdo editorial
          </Link>
        </Button>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden /> Nova editoria
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Editoria</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Conteúdos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Site</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhuma editoria cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-navy">{row.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">/{row.slug}</TableCell>
                  <TableCell className="text-sm">{row.content_count}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "ativa" ? "default" : "secondary"}>
                      {row.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.visible_on_site ? "Sim" : "Não"}</TableCell>
                  <TableCell className="space-x-1 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Editar"
                      onClick={() => {
                        setEditing(row);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStatus.mutate({
                          id: row.id,
                          status: row.status === "ativa" ? "inativa" : "ativa",
                        })
                      }
                    >
                      {row.status === "ativa" ? "Desativar" : "Reativar"}
                    </Button>
                    {row.content_count > 0 ? (
                      <Button variant="ghost" size="sm" onClick={() => setTransferFrom(row)}>
                        Transferir
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Excluir a editoria "${row.name}"?`)) remove.mutate(row.id);
                        }}
                      >
                        Excluir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Editorias com conteúdos não podem ser excluídas. Prefira desativar — os conteúdos e o
        histórico continuam preservados — ou transfira os conteúdos para outra editoria.
      </p>

      <EditorialDialog open={dialogOpen} onOpenChange={setDialogOpen} editorial={editing} />

      <Dialog open={!!transferFrom} onOpenChange={(o) => !o && setTransferFrom(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transferir conteúdos</DialogTitle>
            <DialogDescription>
              {transferFrom
                ? `${transferFrom.content_count} conteúdo(s) de "${transferFrom.name}" serão movidos para a editoria escolhida. As URLs desses conteúdos mudarão.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Select value={transferTo} onValueChange={setTransferTo}>
            <SelectTrigger><SelectValue placeholder="Editoria de destino" /></SelectTrigger>
            <SelectContent>
              {rows
                .filter((r) => r.id !== transferFrom?.id)
                .map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTransferFrom(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!transferTo || transfer.isPending}
              onClick={() =>
                transferFrom && transfer.mutate({ from: transferFrom.id, to: transferTo })
              }
            >
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
