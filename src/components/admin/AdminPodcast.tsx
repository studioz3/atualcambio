import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { podcastDelete, podcastList, podcastSave } from "@/lib/podcast.functions";
import { formatDuration, formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-shared";

type Draft = {
  id: string | null;
  titulo: string;
  descricao: string;
  spotify_url: string;
  duracao: string;
  published_at: string;
  ativo: boolean;
};

const emptyDraft: Draft = {
  id: null,
  titulo: "",
  descricao: "",
  spotify_url: "",
  duracao: "",
  published_at: new Date().toISOString().slice(0, 10),
  ativo: true,
};

function toDraft(ep: PodcastEpisode): Draft {
  return {
    id: ep.id,
    titulo: ep.titulo,
    descricao: ep.descricao ?? "",
    spotify_url: ep.spotify_url,
    duracao: ep.duracao_segundos ? String(ep.duracao_segundos) : "",
    published_at: ep.published_at.slice(0, 10),
    ativo: ep.ativo,
  };
}

export function AdminPodcast() {
  const qc = useQueryClient();
  const list = useServerFn(podcastList);
  const save = useServerFn(podcastSave);
  const remove = useServerFn(podcastDelete);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["podcast-episodes-admin"],
    queryFn: () => list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft.titulo.trim() || !draft.spotify_url.trim()) {
        throw new Error("Informe título e link do Spotify.");
      }
      return save({
        data: {
          id: draft.id,
          editoria: "momento-atual",
          titulo: draft.titulo.trim(),
          descricao: draft.descricao.trim() || null,
          spotify_url: draft.spotify_url.trim(),
          duracao_segundos: draft.duracao ? Number(draft.duracao) : null,
          published_at: new Date(`${draft.published_at}T12:00:00Z`).toISOString(),
          ativo: draft.ativo,
          sort_order: 0,
        },
      });
    },
    onSuccess: () => {
      toast.success(draft.id ? "Episódio atualizado." : "Episódio adicionado.");
      setDraft(emptyDraft);
      qc.invalidateQueries({ queryKey: ["podcast-episodes-admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Episódio removido.");
      qc.invalidateQueries({ queryKey: ["podcast-episodes-admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-navy">Episódios ({episodes.length})</h2>
        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {episodes.map((ep) => (
              <li key={ep.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{ep.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatEpisodeDate(ep.published_at)}
                    {formatDuration(ep.duracao_segundos) ? ` · ${formatDuration(ep.duracao_segundos)}` : ""}
                    {ep.ativo ? "" : " · oculto"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDraft(toDraft(ep))}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Remover "${ep.titulo}"?`)) deleteMutation.mutate(ep.id);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        className="h-fit space-y-4 rounded-xl border border-line bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <h2 className="text-lg font-bold text-navy">
          {draft.id ? "Editar episódio" : "Novo episódio"}
        </h2>
        <div>
          <Label htmlFor="ep-titulo">Título</Label>
          <Input
            id="ep-titulo"
            value={draft.titulo}
            onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ep-url">Link do Spotify</Label>
          <Input
            id="ep-url"
            placeholder="https://open.spotify.com/episode/…"
            value={draft.spotify_url}
            onChange={(e) => setDraft({ ...draft, spotify_url: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ep-desc">Descrição (opcional)</Label>
          <Textarea
            id="ep-desc"
            rows={3}
            value={draft.descricao}
            onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ep-data">Publicado em</Label>
            <Input
              id="ep-data"
              type="date"
              value={draft.published_at}
              onChange={(e) => setDraft({ ...draft, published_at: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ep-dur">Duração (s)</Label>
            <Input
              id="ep-dur"
              inputMode="numeric"
              value={draft.duracao}
              onChange={(e) => setDraft({ ...draft, duracao: e.target.value.replace(/\D/g, "") })}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="ep-ativo"
            checked={draft.ativo}
            onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
          />
          <Label htmlFor="ep-ativo">Visível no site</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {draft.id ? "Salvar" : "Adicionar"}
          </Button>
          {draft.id ? (
            <Button type="button" variant="ghost" onClick={() => setDraft(emptyDraft)}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
