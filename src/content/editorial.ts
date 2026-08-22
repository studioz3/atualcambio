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

import edtMomento from "@/assets/edt-momento-atual.jpg";
import edtCriptoWine from "@/assets/edt-cripto-wine.jpg";
import edtVidaAtual from "@/assets/edt-vida-atual.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";

export const SITE_URL = "https://atualcambio.lovable.app";

export type EditoriaId = "momento-atual" | "cripto-wine" | "vida-atual";
export type ArticleStatus = "rascunho" | "revisao" | "publicado";
export type EditorialTone = "editorial" | "cultural" | "wellness";

export type ContentBlock =
  | { type: "paragrafo"; text: string }
  | { type: "subtitulo"; text: string }
  | { type: "lista"; items: string[] }
  | { type: "citacao"; text: string };

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
  path: "/momento-atual" | "/cripto-wine" | "/vida-atual";
  eyebrow: string;
  headline: string;
  subheadline: string;
  promise: string;
  shortDescription: string;
  tone: EditorialTone;
  image: string;
  imageAlt: string;
  categories: string[];
  /** Pautas em preparação — exibidas como "Em breve", nunca como publicadas. */
  upcoming: { title: string; description: string; categoria: string }[];
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
    image: edtMomento,
    imageAlt: "Profissional lendo um jornal econômico diante do skyline de um centro financeiro",
    categories: [
      "Economia",
      "Câmbio",
      "Mercados",
      "Comércio internacional",
      "Política econômica",
      "Geopolítica",
      "Regulação",
    ],
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
    subheadline:
      "Conversas sobre vinho, mercado, tecnologia e tudo o que conecta esses mundos.",
    promise: "Onde vinho, tecnologia, cultura e mercado se encontram.",
    shortDescription: "Vinho, tecnologia, cultura e negócios.",
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
  },
  {
    id: "vida-atual",
    name: "Vida Atual",
    path: "/vida-atual",
    eyebrow: "Wellness · Comportamento · Qualidade de vida",
    headline: "Vida Atual",
    subheadline: "Ideias, tendências e informação para viver melhor.",
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
  },
];

export const editoriaMap = Object.fromEntries(editorias.map((e) => [e.id, e])) as Record<
  EditoriaId,
  Editoria
>;

/* ---------------- CTAs contextuais ---------------- */

const ctaRemessas: ArticleCta = {
  title: "Vai movimentar recursos para o exterior?",
  description: "A Atual acompanha a operação do início ao fim, com especialista quando precisar.",
  label: "Conhecer remessas internacionais",
  to: "/solucoes",
};

const ctaEmpresas: ArticleCta = {
  title: "Sua empresa opera no mercado internacional?",
  description: "Pagamentos, recebimentos e apoio na documentação exigida.",
  label: "Conhecer soluções para empresas",
  to: "/empresas",
};

export const ctaStablecoins: ArticleCta = {
  title: "Conheça as soluções em USDT e USDC da Atual.",
  description: "Operações com stablecoins dentro de um ambiente regulado.",
  label: "Ver stablecoins",
  to: "/stablecoins",
};

/* ---------------- Artigos ---------------- */

const now = "2026-08-20T12:00:00.000Z";

export const articles: Article[] = [
  {
    id: "ma-001",
    editoria: "momento-atual",
    categoria: "Câmbio",
    titulo: "O que observar no câmbio antes de fechar uma operação",
    slug: "o-que-observar-no-cambio-antes-de-fechar-uma-operacao",
    subtitulo:
      "Informação, calendário e objetivo definido valem mais do que tentar adivinhar o próximo movimento.",
    resumo:
      "Como estruturar decisões de câmbio com informação, calendário e objetivo — sem depender de palpite.",
    imagem_principal: editorial1,
    imagem_alt: "Mesa de trabalho com gráficos econômicos impressos",
    conteudo: [
      {
        type: "paragrafo",
        text: "Toda operação de câmbio começa antes da cotação. Ela começa quando você define o objetivo: o que precisa ser pago, quando precisa ser pago e qual variação você consegue absorver sem comprometer o restante do planejamento.",
      },
      { type: "subtitulo", text: "Comece pelo objetivo, não pela cotação" },
      {
        type: "paragrafo",
        text: "Uma operação com data fixa — um pagamento a fornecedor, uma mensalidade no exterior, uma viagem marcada — pede uma decisão diferente de uma operação sem prazo definido. No primeiro caso, previsibilidade tende a valer mais do que a tentativa de capturar o melhor preço do mês.",
      },
      { type: "subtitulo", text: "Considere o calendário" },
      {
        type: "lista",
        items: [
          "Decisões de política monetária no Brasil e no exterior",
          "Divulgação de indicadores econômicos relevantes",
          "Feriados bancários no país de origem e no de destino",
          "Horários de fechamento do mercado e do banco recebedor",
        ],
      },
      {
        type: "paragrafo",
        text: "Esses eventos não indicam direção. Eles indicam quando o mercado tende a se movimentar mais — e ajudam a evitar decisões tomadas no pior momento operacional.",
      },
      { type: "subtitulo", text: "Entenda o custo total" },
      {
        type: "paragrafo",
        text: "A cotação é uma parte do custo. Tributos aplicáveis, tarifas do banco recebedor e a forma de liquidação também compõem o valor final. Comparar apenas o número da tela leva a conclusões incompletas.",
      },
      { type: "subtitulo", text: "Documente a finalidade" },
      {
        type: "paragrafo",
        text: "Toda operação de câmbio tem uma finalidade declarada, e ela define a documentação exigida. Organizar isso antes evita retrabalho e atrasos no fechamento.",
      },
      {
        type: "citacao",
        text: "Decisão de câmbio bem tomada é a que você consegue explicar depois — com objetivo, prazo e custo claros.",
      },
    ],
    autor: "Redação Atual",
    data: "2026-08-12T09:00:00.000Z",
    fonte: [
      { label: "Banco Central do Brasil — Mercado de câmbio", url: "https://www.bcb.gov.br" },
    ],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "O que observar no câmbio antes de fechar uma operação | Momento Atual",
    meta_description:
      "Objetivo, calendário, custo total e documentação: como estruturar uma decisão de câmbio sem depender de palpite.",
    cta: ctaRemessas,
    destaque: true,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
  {
    id: "ma-002",
    editoria: "momento-atual",
    categoria: "Comércio internacional",
    titulo: "Pagamentos internacionais: o que muda para a sua empresa",
    slug: "pagamentos-internacionais-o-que-muda-para-a-sua-empresa",
    subtitulo:
      "Documentação, prazos operacionais e o papel do especialista no fluxo de importação.",
    resumo:
      "Documentação, prazos operacionais e o papel do especialista no fluxo de importação.",
    imagem_principal: editorial2,
    imagem_alt: "Contêineres em terminal portuário",
    conteudo: [
      {
        type: "paragrafo",
        text: "Para uma empresa, o pagamento internacional raramente é um evento isolado. Ele faz parte de um fluxo que envolve contrato, fornecedor, logística, documentação e caixa — e cada um desses elementos influencia o momento e o formato da operação.",
      },
      { type: "subtitulo", text: "O que costuma ser exigido" },
      {
        type: "lista",
        items: [
          "Documentos societários e cadastro da empresa atualizados",
          "Documento comercial que sustente a operação (contrato, fatura ou equivalente)",
          "Dados completos e conferidos do beneficiário no exterior",
          "Finalidade da operação corretamente classificada",
        ],
      },
      {
        type: "paragrafo",
        text: "A lista exata varia conforme o tipo de operação, o valor e o perfil da empresa. Por isso a conferência prévia com um especialista reduz idas e vindas.",
      },
      { type: "subtitulo", text: "Prazo não é só a remessa" },
      {
        type: "paragrafo",
        text: "O prazo percebido pelo fornecedor depende da moeda, do país de destino, do banco recebedor e do horário de fechamento. Uma operação enviada perto do encerramento do expediente no destino costuma ser creditada no próximo dia útil local.",
      },
      { type: "subtitulo", text: "Onde o especialista entra" },
      {
        type: "paragrafo",
        text: "O papel do especialista é antecipar exigências, revisar dados antes do envio e acompanhar o status até a confirmação. Em fluxos recorrentes, isso transforma uma tarefa manual em um processo previsível.",
      },
    ],
    autor: "Redação Atual",
    data: "2026-08-06T09:00:00.000Z",
    fonte: [{ label: "Normativos do mercado de câmbio — Banco Central do Brasil" }],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "Pagamentos internacionais: o que muda para a sua empresa | Momento Atual",
    meta_description:
      "Documentação, prazos operacionais e o papel do especialista no fluxo de pagamentos internacionais de empresas.",
    cta: ctaEmpresas,
    destaque: false,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
  {
    id: "ma-003",
    editoria: "momento-atual",
    categoria: "Regulação",
    titulo: "USDT e USDC dentro de um ambiente regulado",
    slug: "usdt-e-usdc-dentro-de-um-ambiente-regulado",
    subtitulo:
      "O que diferencia uma operação com stablecoin conduzida por uma instituição de câmbio.",
    resumo:
      "O que diferencia uma operação com stablecoin conduzida por uma instituição de câmbio.",
    imagem_principal: editorial3,
    imagem_alt: "Detalhe de tela com dados de mercado",
    conteudo: [
      {
        type: "paragrafo",
        text: "Stablecoins como USDT e USDC circulam em redes públicas, mas a operação de compra e venda pode acontecer em contextos muito diferentes. A diferença relevante não está no ativo: está em quem conduz a operação e sob quais regras.",
      },
      { type: "subtitulo", text: "Identificação e conformidade" },
      {
        type: "paragrafo",
        text: "Em uma instituição autorizada, a operação segue os mesmos princípios das demais: identificação do cliente, verificação da finalidade, monitoramento e registro. Isso não torna o processo mais lento por si só — torna-o rastreável.",
      },
      { type: "subtitulo", text: "Rede e endereço importam" },
      {
        type: "paragrafo",
        text: "Cada stablecoin pode existir em mais de uma rede. Enviar um ativo para um endereço em rede incompatível é um erro operacional sem reversão simples. Confirmar rede e endereço antes de qualquer transferência é parte do processo, não um detalhe.",
      },
      { type: "subtitulo", text: "Este conteúdo não é recomendação" },
      {
        type: "paragrafo",
        text: "Nada aqui constitui recomendação de investimento. O objetivo é explicar como a operação funciona dentro de um ambiente regulado.",
      },
    ],
    autor: "Redação Atual",
    data: "2026-07-29T09:00:00.000Z",
    fonte: [{ label: "Documentação pública dos emissores de USDT e USDC" }],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "USDT e USDC dentro de um ambiente regulado | Momento Atual",
    meta_description:
      "Identificação, conformidade, rede e endereço: o que diferencia uma operação com stablecoin conduzida por uma instituição de câmbio.",
    cta: ctaStablecoins,
    destaque: false,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
];

/* ---------------- Helpers ---------------- */

export function getEditoria(id: EditoriaId): Editoria {
  return editoriaMap[id];
}

export function publishedArticles(editoria?: EditoriaId): Article[] {
  return articles
    .filter((a) => a.status === "publicado" && (!editoria || a.editoria === editoria))
    .sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function featuredArticle(editoria: EditoriaId): Article | null {
  const list = publishedArticles(editoria);
  return list.find((a) => a.destaque) ?? list[0] ?? null;
}

export function articleBySlug(editoria: EditoriaId, slug: string): Article | null {
  return (
    articles.find(
      (a) => a.editoria === editoria && a.slug === slug && a.status === "publicado",
    ) ?? null
  );
}

export function relatedArticles(article: Article, limit = 3): Article[] {
  const sameEditoria = publishedArticles(article.editoria).filter((a) => a.id !== article.id);
  const others = publishedArticles().filter(
    (a) => a.editoria !== article.editoria && a.id !== article.id,
  );
  return [...sameEditoria, ...others].slice(0, limit);
}

export function searchArticles(query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return publishedArticles().filter((a) =>
    [a.titulo, a.subtitulo, a.resumo, a.categoria, editoriaMap[a.editoria].name]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function articleUrl(article: Article): string {
  return `${editoriaMap[article.editoria].path}/${article.slug}`;
}
