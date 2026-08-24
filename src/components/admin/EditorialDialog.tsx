import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editorialSave } from "@/lib/editorials.functions";
import { editorialStatuses, isReservedSlug, type Editorial } from "@/lib/editorials-shared";
import { slugify } from "@/lib/cms-shared";

type Draft = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  status: "ativa" | "inativa";
  visible_on_site: boolean;
  display_order: string;
  image: string;
  meta_title: string;
  meta_description: string;
};

const emptyDraft: Draft = {
  id: null,
  name: "",
  slug: "",
  description: "",
  status: "ativa",
  visible_on_site: true,
  display_order: "0",
  image: "",
  meta_title: "",
  meta_description: "",
};

/**
 * Cadastro/edição de editoria. Usado tanto na tela "Gerenciar editorias"
 * quanto na criação rápida dentro do editor de conteúdo (`compact`).
 */
export function EditorialDialog({
  open,
  onOpenChange,
  editorial,
  compact = false,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorial?: Editorial | null;
  compact?: boolean;
  onSaved?: (result: { id: string; slug: string }) => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [slugTocado, setSlugTocado] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editorial) {
      setSlugTocado(true);
      setDraft({
        id: editorial.id,
        name: editorial.name,
        slug: editorial.slug,
        description: editorial.description ?? "",
        status: editorial.status === "inativa" ? "inativa" : "ativa",
        visible_on_site: editorial.visible_on_site,
        display_order: String(editorial.display_order),
        image: editorial.image ?? "",
        meta_title: editorial.meta_title ?? "",
        meta_description: editorial.meta_description ?? "",
      });
    } else {
      setSlugTocado(false);
      setDraft(emptyDraft);
    }
  }, [open, editorial]);

  const slugAlterado = !!editorial && draft.slug !== editorial.slug;

  const save = useMutation({
    mutationFn: async () => {
      if (draft.name.trim().length < 2) throw new Error("Informe o nome da editoria.");
      const slug = slugify(draft.slug || draft.name);
      if (isReservedSlug(slug)) {
        throw new Error(`O slug "${slug}" já é usado por uma página do site.`);
      }
      if (slugAlterado && !confirm(
        "Alterar este slug pode afetar URLs públicas e SEO. Deseja continuar?",
      )) {
        throw new Error("Alteração de slug cancelada.");
      }
      return editorialSave({
        data: {
          id: draft.id,
          name: draft.name.trim(),
          slug,
          description: draft.description || null,
          status: draft.status,
          visible_on_site: draft.visible_on_site,
          display_order: Number(draft.display_order) || 0,
          image: draft.image || null,
          meta_title: draft.meta_title || null,
          meta_description: draft.meta_description || null,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(draft.id ? "Editoria atualizada." : "Editoria criada.");
      qc.invalidateQueries({ queryKey: ["editorials"] });
      onSaved?.(res);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Editar editoria" : "Nova editoria"}</DialogTitle>
          <DialogDescription>
            Editorias são administráveis: novas editorias aparecem automaticamente nos filtros e no
            cadastro de conteúdo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ed-nome">Nome</Label>
            <Input
              id="ed-nome"
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  slug: slugTocado ? d.slug : slugify(name),
                }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="ed-slug">Slug</Label>
            <Input
              id="ed-slug"
              value={draft.slug}
              onChange={(e) => {
                setSlugTocado(true);
                setDraft((d) => ({ ...d, slug: slugify(e.target.value) }));
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">URL pública: /{draft.slug || "…"}</p>
            {slugAlterado ? (
              <p className="mt-1 text-xs text-destructive">
                Alterar este slug pode afetar URLs públicas e SEO.
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="ed-desc">Descrição</Label>
            <Textarea
              id="ed-desc"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>

          {!compact ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ed-status">Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => setDraft({ ...draft, status: v as "ativa" | "inativa" })}
                  >
                    <SelectTrigger id="ed-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {editorialStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ed-ordem">Ordem de exibição</Label>
                  <Input
                    id="ed-ordem"
                    inputMode="numeric"
                    value={draft.display_order}
                    onChange={(e) =>
                      setDraft({ ...draft, display_order: e.target.value.replace(/\D/g, "") })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ed-img">Imagem/capa (URL)</Label>
                <Input
                  id="ed-img"
                  placeholder="https://…"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ed-metatitle">Meta title</Label>
                <Input
                  id="ed-metatitle"
                  value={draft.meta_title}
                  onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ed-metadesc">Meta description</Label>
                <Textarea
                  id="ed-metadesc"
                  rows={2}
                  value={draft.meta_description}
                  onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="ed-visivel"
                  checked={draft.visible_on_site}
                  onCheckedChange={(v) => setDraft({ ...draft, visible_on_site: v })}
                />
                <Label htmlFor="ed-visivel">Exibir no site</Label>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {draft.id ? "Salvar" : "Criar editoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
