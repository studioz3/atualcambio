import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveSocialPost } from "@/lib/social.functions";
import { buildUtm, contentTypes, editorialLines, socialPlatforms } from "@/lib/social-shared";

const numberOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function SocialPostDialog({ trigger }: { trigger?: React.ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState("instagram");
  const [editorialLine, setEditorialLine] = useState("momento_atual");
  const [contentType, setContentType] = useState("reel");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10));
  const [campaign, setCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [metrics, setMetrics] = useState({
    reach: "",
    impressions: "",
    views: "",
    engagements: "",
    shares: "",
    saves: "",
    clicks: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      saveSocialPost({
        data: {
          platform,
          editorialLine,
          contentType,
          title: title.trim() || null,
          url: url.trim() || null,
          thumbnailUrl: null,
          publishedAt: new Date(`${publishedAt}T12:00:00`).toISOString(),
          campaign: campaign.trim() || null,
          utmCampaign: campaign.trim() || null,
          utmContent: utmContent.trim() || null,
          cmsContentId: null,
          metrics: {
            metricDate: publishedAt,
            reach: numberOrNull(metrics.reach),
            impressions: numberOrNull(metrics.impressions),
            views: numberOrNull(metrics.views),
            engagements: numberOrNull(metrics.engagements),
            shares: numberOrNull(metrics.shares),
            saves: numberOrNull(metrics.saves),
            clicks: numberOrNull(metrics.clicks),
          },
        },
      }),
    onSuccess: () => {
      toast.success("Publicação registrada.");
      qc.invalidateQueries({ queryKey: ["social-overview"] });
      setOpen(false);
      setTitle("");
      setUrl("");
      setMetrics({ reach: "", impressions: "", views: "", engagements: "", shares: "", saves: "", clicks: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const utmPreview = url.trim()
    ? buildUtm({ url: url.trim(), platform, campaign: campaign.trim() || null, content: utmContent.trim() || null })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button size="sm">Nova publicação</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar publicação</DialogTitle>
          <DialogDescription>
            Enquanto as APIs das redes não estão conectadas, você pode registrar publicações e métricas
            manualmente. Nenhum número é estimado pelo sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Rede</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {socialPlatforms.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Editoria</Label>
            <Select value={editorialLine} onValueChange={setEditorialLine}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {editorialLines.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Formato</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {contentTypes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="sp-title">Título</Label>
            <Input id="sp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sp-url">Link da publicação ou do destino no site</Label>
            <Input id="sp-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </div>
          <div>
            <Label htmlFor="sp-date">Publicado em</Label>
            <Input id="sp-date" type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-campaign">Campanha (utm_campaign)</Label>
            <Input id="sp-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sp-content">Identificador da peça (utm_content)</Label>
            <Input
              id="sp-content"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="reel-dolar-2026-02"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              É por esse valor que os leads do site são amarrados a esta publicação.
            </p>
          </div>
        </div>

        {utmPreview ? (
          <div className="rounded-lg border border-line bg-muted/40 p-3">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Link rastreável
            </p>
            <p className="mt-1 break-all text-xs">{utmPreview}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(utmPreview);
                toast.success("Link copiado.");
              }}
            >
              Copiar link
            </Button>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-semibold">Métricas do dia (opcional)</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-4">
            {(
              [
                ["reach", "Alcance"],
                ["impressions", "Impressões"],
                ["views", "Visualizações"],
                ["engagements", "Engajamentos"],
                ["shares", "Compart."],
                ["saves", "Salvos"],
                ["clicks", "Cliques"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`m-${key}`} className="text-xs">{label}</Label>
                <Input
                  id={`m-${key}`}
                  inputMode="numeric"
                  value={metrics[key]}
                  onChange={(e) => setMetrics((m) => ({ ...m, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando…" : "Salvar publicação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
