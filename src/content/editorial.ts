/**
 * CMS editorial da Atual — camada de conteúdo desacoplada da UI.
 *
 * Estrutura preparada para migração futura para banco de dados / CMS externo:
 * os tipos abaixo espelham 1:1 os campos previstos (id, editoria, categoria,
 * título, slug, subtítulo, resumo, imagem, conteúdo, autor, data, fonte,
 * vídeo, áudio, imagem social, SEO, CTA, destaque, status, timestamps).
 *
 * REGRA EDITORIAL: nada aqui pode ser inventado. Editorias sem conteúdo real
 * publicado permanecem com `articles` vazio e exibem pautas marcadas como
 * "Em breve" — nunca artigos, episódios ou convidados fictícios.
 */

import edtMomento from "@/assets/momento-atual-hero.jpg.asset.json";
import edtMomentoMobile from "@/assets/momento-atual-hero-mobile.jpg.asset.json";
import edtCriptoWine from "@/assets/edt-cripto-wine.jpg";
import edtVidaAtual from "@/assets/edt-vida-atual.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";
import maManifesto from "@/assets/ma-manifesto.jpg";
import cwManifesto from "@/assets/cw-manifesto.jpg";
import vaManifesto from "@/assets/va-manifesto.jpg";
import cwPodcast from "@/assets/cw-podcast.jpg";
import cwTecnologia from "@/assets/cw-tecnologia.jpg";
import cwCultura from "@/assets/cw-cultura.jpg";
import vaMovimento from "@/assets/va-movimento.jpg";
import vaLongevidade from "@/assets/va-longevidade.jpg";
import vaComportamento from "@/assets/va-comportamento.jpg";

import type { CmsBlock } from "@/lib/cms-shared";

export const SITE_URL = "https://atualcambio.lovable.app";

/** Slug da editoria — dinâmico: novas editorias são criadas no painel. */
export type EditoriaId = string;
export type ArticleStatus = "rascunho" | "revisao" | "agendado" | "publicado";
export type EditorialTone = "editorial" | "cultural" | "wellness";

export type ContentBlock = CmsBlock;

export type ArticleCta = {
  title: string;
  description: string;
  label: string;
  to: string;
} | null;

export type Article = {
  id: string;
  editoria: EditoriaId;
  categoria: string;
  titulo: string;
  slug: string;
  subtitulo: string;
  resumo: string;
  imagem_principal: string;
  imagem_alt: string;
  conteudo: ContentBlock[];
  autor: string;
  data: string; // ISO
  fonte: { label: string; url?: string }[];
  video_url: string | null;
  audio_url: string | null;
  imagem_social: string | null;
  seo_title: string;
  meta_description: string;
  cta: ArticleCta;
  destaque: boolean;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};

export type Editoria = {
  id: EditoriaId;
  name: string;
  path: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  promise: string;
  shortDescription: string;
  tone: EditorialTone;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  categories: string[];
  /** Pautas em preparação — exibidas como "Em breve", nunca como publicadas. */
  upcoming: { title: string; description: string; categoria: string }[];
  /** Blocos conceituais da editoria — territórios de cobertura, sem conteúdo publicado. */
  sections?: EditorialSection[];
  /** Podcast oficial da editoria no Spotify. */
  podcast?: {
    titulo: string;
    descricao: string;
    /** URL pública do programa ou episódio no Spotify. */
    url: string;
  };
};

/** Território editorial. Enquanto não houver conteúdo real, aparece como "Em breve". */
export type EditorialSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

/* ---------------- Editorias ---------------- */

export const editorias: Editoria[] = [
  {
    id: "momento-atual",
    name: "Momento Atual",
    path: "/momento-atual",
    eyebrow: "Economia · Política · Mercados",
    headline: "Momento Atual",
    subheadline: "O que está acontecendo no mundo — e por que isso importa.",
    promise: "Entender o que está acontecendo e por que isso importa.",
    shortDescription: "Economia, política, mercados e mundo.",
    tone: "editorial",
    image: edtMomento.url,
    mobileImage: edtMomentoMobile.url,
    imageAlt: "Notas de cem dólares em close, com tratamento azul-noite",
    categories: [
      "Economia",
      "Câmbio",
      "Mercados",
      "Comércio internacional",
      "Política econômica",
      "Geopolítica",
      "Regulação",
    ],
    podcast: {
      titulo: "Momento Atual no Spotify",
      descricao:
        "O programa da Atual Câmbio sobre economia, câmbio e mercados. Ouça os episódios direto por aqui ou siga no Spotify.",
      url: "https://open.spotify.com/show/033FdTYkUs8EDeHpF0Tn8d",
    },
    upcoming: [
      {
        title: "Calendário econômico comentado",
        description: "Leitura das decisões de política monetária que afetam o câmbio.",
        categoria: "Economia",
      },
      {
        title: "Comércio internacional na prática",
        description: "Série sobre fluxos, documentação e prazos em operações de importação.",
        categoria: "Comércio internacional",
      },
    ],
  },
  {
    id: "cripto-wine",
    name: "Cripto Wine",
    path: "/cripto-wine",
    eyebrow: "Vinho · Tecnologia · Cultura",
    headline: "Cripto Wine",
    subheadline: "Onde vinho, tecnologia, cultura e mercado se encontram.",
    promise: "Onde vinho, tecnologia, cultura e mercado se encontram.",
    shortDescription: "Vinho, tecnologia, mercado e cultura.",
    tone: "cultural",
    image: edtCriptoWine,
    imageAlt: "Conversa em uma vinícola com vista para os vinhedos ao entardecer",
    categories: [
      "Vinho",
      "Regiões produtoras",
      "Mercado",
      "Cultura",
      "Gastronomia",
      "Tecnologia",
      "Negócios",
    ],
    upcoming: [
      {
        title: "Conversas com produtores",
        description:
          "Formato de entrevista sobre o ofício, a região e o mercado de quem faz vinho.",
        categoria: "Cultura",
      },
      {
        title: "Vinho e tecnologia",
        description:
          "Rastreabilidade, logística e o que a tecnologia muda na cadeia do vinho.",
        categoria: "Tecnologia",
      },
      {
        title: "Mercado global do vinho",
        description: "Exportação, importação e comportamento de consumo entre países.",
        categoria: "Mercado",
      },
    ],
    sections: [
      {
        id: "podcast",
        label: "Podcast",
        title: "Podcast",
        description:
          "O formato principal da editoria: conversas longas sobre vinho, mercado e tecnologia, gravadas em vídeo e áudio.",
        image: cwPodcast,
        imageAlt: "Mesa de gravação com microfones, fones e taças de vinho em ambiente escuro",
      },
      {
        id: "conversas",
        label: "Conversas",
        title: "Conversas",
        description:
          "Encontros com quem vive o vinho de perto — produção, importação, curadoria e serviço.",
        image: cwCultura,
        imageAlt: "Mesa longa ao entardecer com pessoas conversando à luz de velas",
      },
      {
        id: "mercado",
        label: "Mercado",
        title: "Mercado",
        description:
          "Importação, exportação, câmbio e comportamento de consumo: o vinho como negócio internacional.",
      },
      {
        id: "tecnologia",
        label: "Tecnologia",
        title: "Tecnologia",
        description:
          "Rastreabilidade, logística, dados e o que muda na cadeia do vinho quando a tecnologia entra.",
        image: cwTecnologia,
        imageAlt: "Profissional com tablet ao lado de tanques de inox em vinícola contemporânea",
      },
      {
        id: "cultura",
        label: "Cultura",
        title: "Cultura",
        description:
          "Rituais, gastronomia, viagem e o lugar do vinho na conversa contemporânea.",
      },
      {
        id: "vinho",
        label: "Vinho",
        title: "Vinho",
        description:
          "Regiões, safras, castas e vocabulário — o básico bem explicado, sem esnobismo.",
      },
    ],
  },
  {
    id: "vida-atual",
    name: "Vida Atual",
    path: "/vida-atual",
    eyebrow: "Wellness · Comportamento · Qualidade de vida",
    headline: "Vida Atual",
    subheadline: "Informação para viver melhor em um mundo que muda rápido.",
    promise: "Informação para viver melhor em um mundo que muda rápido.",
    shortDescription: "Wellness, comportamento e qualidade de vida.",
    tone: "wellness",
    image: edtVidaAtual,
    imageAlt: "Mulher se alongando ao ar livre em uma manhã clara na cidade",
    categories: [
      "Saúde e wellness",
      "Comportamento",
      "Longevidade",
      "Tecnologia",
      "Trabalho",
      "Viagens",
    ],
    upcoming: [
      {
        title: "Rotinas que atravessam fusos",
        description: "Sono, deslocamento e trabalho para quem vive entre países.",
        categoria: "Comportamento",
      },
      {
        title: "Longevidade com fontes confiáveis",
        description:
          "Curadoria de pesquisas e especialistas — a Atual atua como curadora, não como autoridade médica.",
        categoria: "Longevidade",
      },
    ],
    sections: [
      {
        id: "wellness",
        label: "Wellness",
        title: "Wellness",
        description:
          "Sono, alimentação, descanso e rotina — o cuidado diário tratado com informação, não com promessa.",
        image: vaComportamento,
        imageAlt: "Mesa de trabalho clara com notebook, caneca e planta junto à janela",
      },
      {
        id: "longevidade",
        label: "Longevidade",
        title: "Longevidade",
        description:
          "Viver mais e melhor a partir de fontes confiáveis. A Atual atua como curadora, nunca como autoridade médica.",
        image: vaLongevidade,
        imageAlt: "Casal caminhando e conversando em um parque iluminado pelo sol",
      },
      {
        id: "comportamento",
        label: "Comportamento",
        title: "Comportamento",
        description:
          "Como as pessoas trabalham, se relacionam e organizam a vida em um mundo que muda rápido.",
      },
      {
        id: "movimento",
        label: "Movimento",
        title: "Movimento",
        description:
          "Exercício, deslocamento e corpo em atividade como parte da rotina, não como exceção.",
        image: vaMovimento,
        imageAlt: "Pessoa correndo à beira-mar em uma manhã ensolarada na cidade",
      },
      {
        id: "tecnologia-e-saude",
        label: "Tecnologia e saúde",
        title: "Tecnologia e saúde",
        description:
          "Dispositivos, dados pessoais e o que a tecnologia realmente muda no cuidado com a saúde.",
      },
      {
        id: "qualidade-de-vida",
        label: "Qualidade de vida",
        title: "Qualidade de vida",
        description:
          "Tempo, cidade, viagem e escolhas cotidianas de quem vive entre lugares e fusos.",
      },
    ],
  },
];

export const editoriaMap: Record<string, Editoria> = Object.fromEntries(
  editorias.map((e) => [e.id, e]),
);

/* ---------------- Helpers ---------------- */

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Editoria pelo slug. Editorias criadas no painel (que não têm arte fixa em
 * código) recebem um perfil genérico — nada aqui é hardcoded como enum.
 */
export function getEditoria(id: EditoriaId): Editoria {
  const found = editoriaMap[id];
  if (found) return found;
  const name = titleFromSlug(id);
  return {
    id,
    name,
    path: `/${id}`,
    eyebrow: name,
    headline: name,
    subheadline: "",
    promise: "",
    shortDescription: "",
    tone: "editorial",
    image: "",
    imageAlt: name,
    categories: [],
    upcoming: [],
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function articleUrl(article: Article): string {
  return `/${article.editoria}/${article.slug}`;
}
