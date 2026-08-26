import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CockpitCard } from "../cockpit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSocialImports, importSpotifyCsv } from "@/lib/social.functions";
import { spotifyColumnAliases, type SpotifyCsvRow } from "@/lib/social-shared";
import { formatDateTime } from "@/lib/admin-shared";

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else quoted = !quoted;
    } else if ((ch === "," || ch === ";" || ch === "\t") && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function toNumber(raw: string | undefined) {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,:-]/g, "");
  if (!cleaned) return null;
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":").map((p) => Number(p) || 0);
    if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
    if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  }
  const n = Number(cleaned.replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function toDate(raw: string | undefined) {
  if (!raw) return null;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}T12:00:00`).toISOString();
  return null;
}

function parseCsv(text: string): { rows: SpotifyCsvRow[]; missing: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], missing: ["cabeçalho"] };
  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const index: Partial<Record<keyof SpotifyCsvRow, number>> = {};
  (Object.keys(spotifyColumnAliases) as (keyof SpotifyCsvRow)[]).forEach((key) => {
    const i = header.findIndex((h) => spotifyColumnAliases[key].some((a) => h.includes(a)));
    if (i >= 0) index[key] = i;
  });
  const missing: string[] = [];
  if (index.episode == null) missing.push("nome do episódio");

  const rows: SpotifyCsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const episode = index.episode != null ? cells[index.episode] : "";
    if (!episode) continue;
    rows.push({
      episode,
      publishedAt: index.publishedAt != null ? toDate(cells[index.publishedAt]) : null,
      plays: index.plays != null ? toNumber(cells[index.plays]) : null,
      listeners: index.listeners != null ? toNumber(cells[index.listeners]) : null,
      totalSeconds: index.totalSeconds != null ? toNumber(cells[index.totalSeconds]) : null,
      avgSeconds: index.avgSeconds != null ? toNumber(cells[index.avgSeconds]) : null,
    });
  }
  return { rows, missing };
}

export function SpotifyImport() {
  const qc = useQueryClient();
  const [rows, setRows] = useState<SpotifyCsvRow[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  const history = useQuery({ queryKey: ["social-imports"], queryFn: () => getSocialImports() });

  const mutation = useMutation({
    mutationFn: () => importSpotifyCsv({ data: { rows, fileName, overwrite } }),
    onSuccess: (res) => {
      toast.success(`${res.imported} linhas importadas · ${res.skipped} ignoradas`);
      setRows([]);
      setFileName(null);
      qc.invalidateQueries({ queryKey: ["social-imports"] });
      qc.invalidateQueries({ queryKey: ["social-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <CockpitCard
        title="Importar CSV do Spotify for Creators"
        subtitle="O Spotify não oferece API pública para analytics de podcast — a importação manual é a fonte oficial."
      >
        <ol className="mb-4 space-y-1 text-xs text-white/50">
          <li>1. Acesse o Spotify for Creators e abra a aba de Analytics do podcast.</li>
          <li>2. Exporte o relatório por episódio (CSV) no período desejado.</li>
          <li>3. Envie o arquivo abaixo — reconhecemos as colunas de reproduções, ouvintes e tempo de consumo.</li>
        </ol>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <Label htmlFor="csv" className="text-white/70">Arquivo CSV</Label>
            <Input
              id="csv"
              type="file"
              accept=".csv,text/csv"
              className="mt-1 text-white"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const parsed = parseCsv(await file.text());
                setRows(parsed.rows);
                setMissing(parsed.missing);
                setFileName(file.name);
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <Switch checked={overwrite} onCheckedChange={setOverwrite} />
            Sobrescrever métricas já importadas
          </label>
        </div>

        {missing.length > 0 ? (
          <p className="mt-3 text-xs text-rose-300">
            Não encontrei as colunas: {missing.join(", ")}. Verifique o cabeçalho do arquivo.
          </p>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="text-white/45">
                  <tr>
                    {["Episódio", "Data", "Reproduções", "Ouvintes", "Tempo total (s)", "Média (s)"].map((h) => (
                      <th key={h} className="pb-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={`${r.episode}-${i}`} className="text-white/80">
                      <td className="max-w-[240px] truncate py-2">{r.episode}</td>
                      <td>{r.publishedAt ? formatDateTime(r.publishedAt) : "—"}</td>
                      <td>{r.plays ?? "—"}</td>
                      <td>{r.listeners ?? "—"}</td>
                      <td>{r.totalSeconds ?? "—"}</td>
                      <td>{r.avgSeconds ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-white/40">
              Pré-visualização de {Math.min(10, rows.length)} de {rows.length} linhas.
            </p>
            <Button className="mt-4" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? "Importando…" : `Importar ${rows.length} linhas`}
            </Button>
          </>
        ) : null}
      </CockpitCard>

      <CockpitCard title="Histórico de importações">
        {(history.data ?? []).length === 0 ? (
          <p className="text-sm text-white/45">Nenhuma importação registrada.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-white/45">
              <tr>
                {["Data", "Arquivo", "Importadas", "Ignoradas", "Período"].map((h) => (
                  <th key={h} className="pb-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(history.data ?? []).map((h) => (
                <tr key={h.id} className="text-white/80">
                  <td className="py-2">{formatDateTime(h.created_at)}</td>
                  <td className="max-w-[220px] truncate">{h.file_name ?? "—"}</td>
                  <td>{h.rows_imported}</td>
                  <td>{h.rows_skipped}</td>
                  <td>
                    {h.period_from ?? "—"} → {h.period_to ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CockpitCard>
    </div>
  );
}
