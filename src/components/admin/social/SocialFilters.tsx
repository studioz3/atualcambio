import { cn } from "@/lib/utils";
import {
  contentTypes,
  editorialLines,
  socialPlatforms,
} from "@/lib/social-shared";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-gold bg-gold text-gold-foreground"
          : "border-white/15 bg-white/5 text-white/60 hover:border-gold/40 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export type TaxonomyFilters = {
  platforms: string[];
  editorialLines: string[];
  contentTypes: string[];
};

export const emptyTaxonomy: TaxonomyFilters = {
  platforms: [],
  editorialLines: [],
  contentTypes: [],
};

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function SocialTaxonomyFilters({
  value,
  onChange,
}: {
  value: TaxonomyFilters;
  onChange: (v: TaxonomyFilters) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">Rede</span>
        {socialPlatforms.map((p) => (
          <Chip
            key={p.id}
            active={value.platforms.includes(p.id)}
            onClick={() => onChange({ ...value, platforms: toggle(value.platforms, p.id) })}
          >
            {p.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">Editoria</span>
        {editorialLines.map((e) => (
          <Chip
            key={e.id}
            active={value.editorialLines.includes(e.id)}
            onClick={() => onChange({ ...value, editorialLines: toggle(value.editorialLines, e.id) })}
          >
            {e.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">Formato</span>
        {contentTypes.map((c) => (
          <Chip
            key={c.id}
            active={value.contentTypes.includes(c.id)}
            onClick={() => onChange({ ...value, contentTypes: toggle(value.contentTypes, c.id) })}
          >
            {c.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
