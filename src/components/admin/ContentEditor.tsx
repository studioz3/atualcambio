import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cmsCategories, cmsGet, cmsSave, cmsStoragePath } from "@/lib/cms.functions";
import {
  CMS_BUCKET,
  blockLabels,
  ctaOptions,
  cmsTipos,
  normalizeBlocks,
  slugify,
  type CmsBlock,
  type CmsStatus,
  type CmsTipo,
} from "@/lib/cms-shared";
import { editorias, type EditoriaId } from "@/content/editorial";
import { ContentBlockView } from "@/components/atual/content-blocks";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";

type Form = {
  id: string | null;
  editoria: EditoriaId;
  tipo: CmsTipo;
  titulo: string;
  subtitulo: string;
  resumo: string;
  slug: string;
  categoria: string;
  autor_nome: string;
  hero_image: string;
  hero_alt: string;
  social_image: string;
  corpo: CmsBlock[];
  related_cta: string;
  destaque_editoria: boolean;
  destaque_home: boolean;
  newsletter_selected: boolean;
  status: CmsStatus;
  seo_title: string;
  meta_description: string;
  canonical: string;
  indexable: boolean;
  audio_url: string;
  video_url: string;
  fontes: { nome: string; url: string }[];
};

const empty: Form = {
  id: null,
  editoria: "momento-atual",
  tipo: "artigo",
  titulo: "",
  subtitulo: "",
  resumo: "",
  slug: "",
  categoria: "",
  autor_nome: "Redação Atual",
  hero_image: "",
  hero_alt: "",
  social_image: "",
  corpo: [{ type: "paragrafo", text: "" }],
  related_cta: "nenhum",
  destaque_editoria: false,
  destaque_home: false,
  newsletter_selected: false,
  status: "rascunho",
  seo_title: "",
  meta_description: "",
  canonical: "",
  indexable: true,
  audio_url: "",
  video_url: "",
  fontes: [],
};

const blockTypes: CmsBlock["type"][] = [
  "paragrafo",
  "h2",
  "h3",
  "lista",
  "lista_numerada",
  "citacao",
  "destaque",
  "imagem",
  "spotify",
  "divisor",
];

function newBlock(type: CmsBlock["type"]): CmsBlock {
  switch (type) {
    case "lista":
    case "lista_numerada":
      return { type, items: [""] };
    case "imagem":
      return { type: "imagem", url: "", alt: "" };
    case "spotify":
      return { type: "spotify", url: "" };
    case "divisor":
      return { type: "divisor" };
    default:
      return { type: type as "paragrafo", text: "" };
  }
}

async function uploadImage(file: File): Promise<string> {
  const { path } = await cmsStoragePath({ data: { filename: file.name } });
  const { error } = await supabase.storage
    .from(CMS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from(CMS_BUCKET).getPublicUrl(path).data.publicUrl;
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <Label className="text-navy">{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
        <Button type="button" variant="secondary" disabled={busy} asChild>
          <label className="cursor-pointer">
            <Upload className="size-4" aria-hidden /> {busy ? "Enviando…" : "Enviar"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  onChange(await uploadImage(file));
                  toast.success("Imagem enviada.");
                } catch {
                  toast.error("Falha no envio da imagem.");
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </Button>
      </div>
      {value ? (
        <img src={value} alt="" className="h-32 w-full rounded-md object-cover" />
      ) : null}
    </div>
  );
}

export function ContentEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(empty);
  const [slugTocado, setSlugTocado] = useState(false);

  const existing = useQuery({
    queryKey: ["cms-item", id],
    queryFn: () => cmsGet({ data: { id: id! } }),
    enabled: !!id,
  });

  const categorias = useQuery({ queryKey: ["cms-categories"], queryFn: () => cmsCategories() });

  useEffect(() => {
    const data = existing.data;
    if (!data) return;
    const r = data.row;
    setSlugTocado(true);
    setForm({
      id: r.id,
      editoria: r.editoria,
      tipo: r.tipo,
      titulo: r.titulo,
      subtitulo: r.subtitulo ?? "",
      resumo: r.resumo ?? "",
      slug: r.slug,
      categoria: r.categoria ?? "",
      autor_nome: r.autor_nome ?? "Redação Atual",
      hero_image: r.hero_image ?? "",
      hero_alt: r.hero_alt ?? "",
      social_image: r.social_image ?? "",
      corpo: normalizeBlocks(r.corpo),
      related_cta: r.related_cta,
      destaque_editoria: r.destaque_editoria,
      destaque_home: r.destaque_home,
      newsletter_selected: r.newsletter_selected,
      status: r.status,
      seo_title: r.seo_title ?? "",
      meta_description: r.meta_description ?? "",
      canonical: r.canonical ?? "",
      indexable: r.indexable,
      audio_url: r.podcast?.audio_url ?? "",
      video_url: r.video?.url ?? "",
      fontes: data.fontes.map((f) => ({ nome: f.nome, url: f.url ?? "" })),
    });
  }, [existing.data]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setBlock = (index: number, block: CmsBlock) =>
    setForm((f) => ({ ...f, corpo: f.corpo.map((b, i) => (i === index ? block : b)) }));

  const moveBlock = (index: number, dir: -1 | 1) =>
    setForm((f) => {
      const next = [...f.corpo];
      const target = index + dir;
      if (target < 0 || target >= next.length) return f;
      const a = next[index]!;
      next[index] = next[target]!;
      next[target] = a;
      return { ...f, corpo: next };
    });

  const categoriasEditoria = useMemo(
    () => (categorias.data ?? []).filter((c) => c.editoria === form.editoria),
    [categorias.data, form.editoria],
  );

  const save = useMutation({
    mutationFn: async (status: CmsStatus) => {
      if (form.titulo.trim().length < 3) throw new Error("Informe um título.");
      if (status === "publicado") {
        if (!form.resumo.trim()) throw new Error("Resumo é obrigatório para publicar.");
        if (!form.hero_image.trim()) throw new Error("Imagem principal é obrigatória para publicar.");
        if (!form.hero_alt.trim()) throw new Error("Texto alternativo da imagem é obrigatório.");
      }
      return cmsSave({
        data: {
          id: form.id,
          editoria: form.editoria,
          tipo: form.tipo,
          titulo: form.titulo.trim(),
          subtitulo: form.subtitulo || null,
          resumo: form.resumo || null,
          slug: form.slug || slugify(form.titulo),
          categoria: form.categoria || null,
          autor_nome: form.autor_nome || null,
          hero_image: form.hero_image || null,
          hero_alt: form.hero_alt || null,
          social_image: form.social_image || null,
          corpo: form.corpo as unknown as Record<string, unknown>[],
          related_cta: form.related_cta,
          destaque_editoria: form.destaque_editoria,
          destaque_home: form.destaque_home,
          newsletter_selected: form.newsletter_selected,
          status,
          seo_title: form.seo_title || null,
          meta_description: form.meta_description || null,
          canonical: form.canonical || null,
          indexable: form.indexable,
          podcast: form.audio_url ? { audio_url: form.audio_url } : null,
          video: form.video_url ? { url: form.video_url } : null,
          fontes: form.fontes.filter((f) => f.nome.trim()).map((f) => ({ nome: f.nome, url: f.url || null })),
        },
      });
    },
    onSuccess: (res, status) => {
      toast.success(status === "publicado" ? "Conteúdo publicado." : "Conteúdo salvo.");
      set("status", status);
      if (!form.id) {
        navigate({ to: "/admin/conteudo/$id", params: { id: res.id } });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  const slugPreview = `/${form.editoria}/${form.slug || slugify(form.titulo) || "…"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{slugPreview}</p>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" disabled={save.isPending} onClick={() => save.mutate("rascunho")}>
            Salvar rascunho
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate("publicado")}>
            Publicar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="conteudo">
        <TabsList>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="midia">Mídia e fontes</TabsTrigger>
          <TabsTrigger value="seo">SEO e distribuição</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="space-y-6 pt-6">
          <div className="grid gap-4 rounded-xl border border-line bg-white p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-navy">Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => {
                  set("titulo", e.target.value);
                  if (!slugTocado) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <Label className="text-navy">Editoria</Label>
              <Select value={form.editoria} onValueChange={(v) => set("editoria", v as EditoriaId)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {editorias.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-navy">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v as CmsTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cmsTipos.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-navy">Categoria</Label>
              <Select value={form.categoria || "—"} onValueChange={(v) => set("categoria", v === "—" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="—">Sem categoria</SelectItem>
                  {categoriasEditoria.map((c) => (
                    <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-navy">Autor</Label>
              <Input value={form.autor_nome} onChange={(e) => set("autor_nome", e.target.value)} />
            </div>
            <div>
              <Label className="text-navy">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTocado(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <Label className="text-navy">CTA relacionado</Label>
              <Select value={form.related_cta} onValueChange={(v) => set("related_cta", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ctaOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-navy">Subtítulo</Label>
              <Textarea value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-navy">Resumo (usado nos cards e no SEO)</Label>
              <Textarea value={form.resumo} onChange={(e) => set("resumo", e.target.value)} rows={3} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy">Corpo do conteúdo</h2>
              <p className="text-xs text-muted-foreground">
                Formatação: **negrito**, *itálico*, [texto](link)
              </p>
            </div>

            {form.corpo.map((block, i) => (
              <div key={i} className="rounded-lg border border-line p-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={block.type}
                    onValueChange={(v) => setBlock(i, newBlock(v as CmsBlock["type"]))}
                  >
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {blockTypes.map((t) => (
                        <SelectItem key={t} value={t}>{blockLabels[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveBlock(i, -1)} title="Subir">
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveBlock(i, 1)} title="Descer">
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Remover"
                      onClick={() => set("corpo", form.corpo.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  {block.type === "lista" || block.type === "lista_numerada" ? (
                    <div className="space-y-2">
                      {block.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) =>
                              setBlock(i, {
                                ...block,
                                items: block.items.map((it, j) => (j === idx ? e.target.value : it)),
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setBlock(i, { ...block, items: block.items.filter((_, j) => j !== idx) })
                            }
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setBlock(i, { ...block, items: [...block.items, ""] })}
                      >
                        <Plus className="size-4" aria-hidden /> Item
                      </Button>
                    </div>
                  ) : block.type === "imagem" ? (
                    <div className="space-y-3">
                      <ImageField
                        label="Imagem"
                        value={block.url}
                        onChange={(url) => setBlock(i, { ...block, url })}
                      />
                      <Input
                        placeholder="Texto alternativo"
                        value={block.alt}
                        onChange={(e) => setBlock(i, { ...block, alt: e.target.value })}
                      />
                      <Input
                        placeholder="Legenda (opcional)"
                        value={block.legenda ?? ""}
                        onChange={(e) => setBlock(i, { ...block, legenda: e.target.value })}
                      />
                    </div>
                  ) : block.type === "spotify" ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Link do Spotify (episódio, programa ou playlist)"
                        value={block.url}
                        onChange={(e) => setBlock(i, { ...block, url: e.target.value })}
                      />
                      <Input
                        placeholder="Título do player (opcional)"
                        value={block.titulo ?? ""}
                        onChange={(e) => setBlock(i, { ...block, titulo: e.target.value })}
                      />
                    </div>
                  ) : block.type === "divisor" ? (
                    <p className="text-sm text-muted-foreground">Divisor visual.</p>
                  ) : (
                    <Textarea
                      rows={block.type === "paragrafo" ? 4 : 2}
                      value={block.text}
                      onChange={(e) => setBlock(i, { ...block, text: e.target.value })}
                    />
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {blockTypes.map((t) => (
                <Button
                  key={t}
                  variant="secondary"
                  size="sm"
                  onClick={() => set("corpo", [...form.corpo, newBlock(t)])}
                >
                  <Plus className="size-4" aria-hidden /> {blockLabels[t]}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="midia" className="space-y-6 pt-6">
          <div className="grid gap-6 rounded-xl border border-line bg-white p-6 md:grid-cols-2">
            <ImageField
              label="Imagem principal"
              value={form.hero_image}
              onChange={(v) => set("hero_image", v)}
            />
            <div>
              <Label className="text-navy">Texto alternativo da imagem</Label>
              <Input value={form.hero_alt} onChange={(e) => set("hero_alt", e.target.value)} />
            </div>
            {form.tipo === "video" ? (
              <div className="md:col-span-2">
                <Label className="text-navy">URL do vídeo (embed)</Label>
                <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
              </div>
            ) : null}
            {form.tipo === "podcast" ? (
              <div className="md:col-span-2">
                <Label className="text-navy">URL do áudio</Label>
                <Input value={form.audio_url} onChange={(e) => set("audio_url", e.target.value)} />
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-white p-6">
            <h2 className="font-semibold text-navy">Fontes</h2>
            {form.fontes.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Nome da fonte"
                  value={f.nome}
                  onChange={(e) =>
                    set("fontes", form.fontes.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Link (opcional)"
                  value={f.url}
                  onChange={(e) =>
                    set("fontes", form.fontes.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => set("fontes", form.fontes.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => set("fontes", [...form.fontes, { nome: "", url: "" }])}
            >
              <Plus className="size-4" aria-hidden /> Fonte
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 pt-6">
          <div className="grid gap-4 rounded-xl border border-line bg-white p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-navy">Title (SEO)</Label>
              <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">{form.seo_title.length}/60 caracteres</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-navy">Meta description</Label>
              <Textarea
                rows={2}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.meta_description.length}/160 caracteres
              </p>
            </div>
            <ImageField
              label="Imagem social (og:image)"
              value={form.social_image}
              onChange={(v) => set("social_image", v)}
            />
            <div>
              <Label className="text-navy">Canonical (opcional)</Label>
              <Input value={form.canonical} onChange={(e) => set("canonical", e.target.value)} />
            </div>
            <div className="space-y-4 md:col-span-2">
              {[
                ["indexable", "Permitir indexação nos buscadores"],
                ["destaque_editoria", "Destaque na editoria"],
                ["destaque_home", "Destaque na Home"],
                ["newsletter_selected", "Selecionar para a newsletter"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-navy">{label}</Label>
                  <Switch
                    checked={form[key as keyof Form] as boolean}
                    onCheckedChange={(v) => set(key as keyof Form, v as never)}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-6">
          <div className="rounded-xl border border-line bg-white p-8">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-gold uppercase">
              {form.categoria || "Sem categoria"}
            </p>
            <h2 className="display-h3 mt-3 text-navy">{form.titulo || "Sem título"}</h2>
            <p className="mt-3 text-muted-foreground">{form.subtitulo}</p>
            {form.hero_image ? (
              <img
                src={form.hero_image}
                alt={form.hero_alt}
                className="mt-6 aspect-[16/9] w-full rounded-lg object-cover"
              />
            ) : null}
            <div className="mx-auto mt-8 max-w-[68ch]">
              {form.corpo.map((b, i) => (
                <ContentBlockView key={i} block={b} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
