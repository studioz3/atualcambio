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
import maManifesto from "@/assets/ma-manifesto.jpg";
import cwManifesto from "@/assets/cw-manifesto.jpg";
import vaManifesto from "@/assets/va-manifesto.jpg";
import cwPodcast from "@/assets/cw-podcast.jpg";
import cwTecnologia from "@/assets/cw-tecnologia.jpg";
import cwCultura from "@/assets/cw-cultura.jpg";
import vaMovimento from "@/assets/va-movimento.jpg";
import vaLongevidade from "@/assets/va-longevidade.jpg";
import vaComportamento from "@/assets/va-comportamento.jpg";

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
  /** Blocos conceituais da editoria — territórios de cobertura, sem conteúdo publicado. */
  sections?: EditorialSection[];
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

/** CTA editorial (sem oferta comercial) — leva à newsletter da própria editoria. */
function ctaEditorial(id: EditoriaId): ArticleCta {
  const nome = editoriaMap[id].name;
  return {
    title: `Acompanhe o ${nome}`,
    description:
      "Receba os próximos conteúdos desta editoria por e-mail. Sem oferta comercial: só conteúdo.",
    label: `Acompanhe o ${nome}`,
    to: `/newsletter?editoria=${id}`,
  };
}

export const articles: Article[] = [
  {
    id: "ma-000",
    editoria: "momento-atual",
    categoria: "Editorial",
    titulo: "O mundo muda antes da cotação",
    slug: "o-mundo-muda-antes-da-cotacao",
    subtitulo:
      "Economia, política e mercados não acontecem em compartimentos separados. O Momento Atual nasce para conectar os fatos antes que eles cheguem às nossas decisões.",
    resumo:
      "O manifesto inaugural do Momento Atual: por que economia, política e mercados precisam ser lidos juntos — e o que isso muda nas decisões de quem vive em um mundo conectado.",
    imagem_principal: maManifesto,
    imagem_alt:
      "Profissional lendo o caderno de mercados diante da vista de um centro financeiro ao entardecer",
    conteudo: [
      {
        type: "paragrafo",
        text: "Uma decisão tomada em Washington pode aparecer alguns minutos depois na cotação do dólar em São Paulo. Uma eleição pode alterar expectativas antes mesmo de alterar leis. Uma guerra a milhares de quilômetros pode mudar o preço de uma commodity, afetar empresas, pressionar inflação e chegar ao custo de vida de quem nunca acompanhou aquela região do mapa.",
      },
      {
        type: "paragrafo",
        text: "O mundo não avisa quando uma notícia deixa de ser apenas uma notícia e passa a afetar nossas escolhas. É exatamente nesse espaço que nasce o Momento Atual.",
      },
      {
        type: "paragrafo",
        text: "Não para prever o futuro. Não para transformar cada movimento de mercado em urgência. E muito menos para tentar explicar o mundo inteiro em uma manchete. O objetivo é outro: entender o que aconteceu, por que aconteceu e o que isso pode mudar.",
      },
      { type: "subtitulo", text: "Os acontecimentos estão conectados" },
      {
        type: "paragrafo",
        text: "Durante muito tempo, economia parecia assunto de economista. Política, assunto de político. Mercado financeiro, assunto de investidor. Comércio exterior, assunto de grandes empresas. Tecnologia, assunto de especialistas. Essa divisão faz cada vez menos sentido.",
      },
      {
        type: "lista",
        items: [
          "Uma decisão de juros nos Estados Unidos influencia fluxos internacionais de capital.",
          "Uma mudança tecnológica pode alterar cadeias produtivas inteiras.",
          "Uma nova regulamentação pode criar ou destruir mercados.",
          "Uma eleição muda expectativas.",
          "Uma crise diplomática pode afetar moedas, energia, alimentos e empresas.",
        ],
      },
      {
        type: "paragrafo",
        text: "E tudo isso chega, cedo ou tarde, às decisões de pessoas comuns. Viajar ou esperar. Importar agora ou depois. Investir ou manter liquidez. Comprar um imóvel no exterior. Enviar recursos para um filho estudando em outro país. Planejar a expansão de uma empresa. Nenhuma dessas decisões acontece isoladamente. Existe sempre um contexto.",
      },
      { type: "subtitulo", text: "Informação não é previsão" },
      {
        type: "paragrafo",
        text: "Existe uma enorme diferença entre tentar adivinhar o que vai acontecer e compreender os fatores que estão em movimento. O Momento Atual não nasce para dizer “o dólar vai subir” ou “o mercado vai cair”. Nasce para fazer perguntas melhores.",
      },
      {
        type: "lista",
        items: [
          "O que mudou?",
          "Por que o mercado reagiu?",
          "Que forças estão atuando?",
          "Quais cenários estão sendo considerados?",
          "Quem pode ser afetado?",
          "O que ainda não sabemos?",
        ],
      },
      {
        type: "citacao",
        text: "Boa informação não elimina a incerteza. Ela torna a incerteza mais compreensível.",
      },
      { type: "subtitulo", text: "Menos ruído. Mais contexto." },
      {
        type: "paragrafo",
        text: "Vivemos cercados de informação. O problema deixou de ser acesso. O problema passou a ser seleção. A mesma notícia aparece dezenas de vezes, muitas vezes sem explicar por que merece nossa atenção. Um indicador econômico pode gerar manchetes completamente diferentes dependendo de quem o interpreta. Um movimento de mercado pode ser transformado em euforia ou pânico em poucos minutos.",
      },
      {
        type: "paragrafo",
        text: "O Momento Atual quer ocupar outro lugar. O da informação que ajuda a organizar o cenário. Dados com fonte. Contexto histórico quando ele for necessário. Perspectivas diferentes quando houver debate. E a disposição de dizer: ainda é cedo para saber. Num mundo cheio de opiniões instantâneas, reconhecer os limites da informação também é uma forma de inteligência.",
      },
      { type: "subtitulo", text: "Economia é uma história sobre pessoas" },
      {
        type: "paragrafo",
        text: "Por trás de juros, moedas, inflação e índices existem decisões humanas. Famílias tentando organizar o orçamento. Empresas escolhendo onde investir. Governos definindo prioridades. Empreendedores assumindo riscos. Pessoas mudando de país. Investidores buscando proteção. Profissionais tentando compreender como uma transformação global pode afetar sua carreira.",
      },
      {
        type: "paragrafo",
        text: "Por isso, queremos falar de economia sem tratá-la apenas como uma coleção de números. E falar de política sem reduzi-la à disputa política. O que nos interessa é a consequência. A conexão entre o fato e a vida real.",
      },
      { type: "subtitulo", text: "O que você vai encontrar aqui" },
      {
        type: "paragrafo",
        text: "O Momento Atual vai acompanhar temas como economia global, câmbio, juros, inflação, empresas, tecnologia, comércio internacional, política econômica, geopolítica, regulação e transformações de mercado.",
      },
      {
        type: "paragrafo",
        text: "Algumas vezes, uma notícia exigirá um texto longo. Em outras, um gráfico explicará melhor. Às vezes será necessário ouvir um especialista. Em outras, bastará mostrar um número que passou despercebido. O formato muda. O compromisso não: informação para decidir com contexto.",
      },
      { type: "subtitulo", text: "Porque o mundo não espera" },
      {
        type: "paragrafo",
        text: "As decisões acontecem mesmo quando não temos todas as respostas. O empresário precisa decidir. O investidor precisa avaliar. A família precisa planejar. O viajante precisa organizar a viagem. Quem vive em um mundo conectado precisa entender um pouco mais do que acontece fora da própria rotina.",
      },
      {
        type: "paragrafo",
        text: "Não para viver preocupado com cada notícia. Mas para reconhecer aquelas que realmente importam. É essa a proposta do Momento Atual. Observar o mundo. Conectar os fatos. Separar sinal de ruído. E ajudar você a entender o presente antes de tomar a próxima decisão.",
      },
      { type: "citacao", text: "Momento Atual. Informação para decidir com contexto." },
    ],
    autor: "Redação Atual",
    data: "2026-08-22T09:00:00.000Z",
    fonte: [],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "O mundo muda antes da cotação | Momento Atual",
    meta_description:
      "O Momento Atual nasce para conectar economia, política e mercados e explicar por que os acontecimentos do mundo importam para nossas decisões.",
    cta: ctaEditorial("momento-atual"),
    destaque: true,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
  {
    id: "cw-000",
    editoria: "cripto-wine",
    categoria: "Manifesto",
    titulo: "O futuro também envelhece em barris",
    slug: "o-futuro-tambem-envelhece-em-barris",
    subtitulo:
      "Um universo fala de terroir, safra e tradição. O outro, de blockchain, dados e transformação. O Cripto Wine nasce justamente onde esses mundos começam a se encontrar.",
    resumo:
      "O manifesto inaugural do Cripto Wine: o que acontece quando vinho, tecnologia, cultura e mercado sentam à mesma mesa.",
    imagem_principal: cwManifesto,
    imagem_alt: "Produtor e enóloga conferindo barris de carvalho em uma adega iluminada",
    conteudo: [
      {
        type: "paragrafo",
        text: "Um bom vinho pode levar décadas para alcançar seu melhor momento. A tecnologia, ao contrário, parece envelhecer em meses. Um universo respeita o tempo. O outro tenta acelerá-lo.",
      },
      {
        type: "paragrafo",
        text: "Um fala de solo, clima, safra, produtores e tradição. O outro fala de blockchain, inteligência artificial, rastreabilidade, tokens e redes digitais. À primeira vista, vinho e tecnologia parecem pertencer a mundos completamente diferentes. Mas basta olhar um pouco mais de perto. Os dois falam de algo parecido: valor.",
      },
      { type: "subtitulo", text: "O que torna alguma coisa valiosa?" },
      {
        type: "paragrafo",
        text: "No vinho, valor pode nascer de uma combinação quase impossível de reproduzir. Uma região específica. Uma safra excepcional. Um produtor. Uma história. Poucas garrafas. Décadas de reputação.",
      },
      {
        type: "lista",
        items: [
          "Quem garante a autenticidade?",
          "Como provar a origem?",
          "Como registrar uma transação?",
          "Como criar confiança entre pessoas que não se conhecem?",
          "Como transformar algo físico em informação verificável?",
        ],
      },
      {
        type: "paragrafo",
        text: "São perguntas diferentes. Mas existe uma palavra comum entre elas: confiança.",
      },
      { type: "subtitulo", text: "A tecnologia já entrou na adega" },
      {
        type: "paragrafo",
        text: "Talvez ainda não percebamos, mas a indústria do vinho é também uma indústria de tecnologia. Sensores ajudam produtores a compreender solo e clima. Dados orientam decisões no campo. Inteligência artificial começa a participar de processos de produção, distribuição e recomendação. Blockchain é estudado como ferramenta de rastreabilidade. Novas plataformas mudam a maneira como vinhos são comercializados. Mercados internacionais conectam consumidores a pequenos produtores que antes dependiam de estruturas tradicionais de distribuição.",
      },
      {
        type: "paragrafo",
        text: "Até a velha pergunta — “Essa garrafa é realmente o que diz ser?” — ganha novas respostas. A tecnologia não elimina tradição. Em muitos casos, pode ajudá-la a sobreviver.",
      },
      { type: "subtitulo", text: "O vinho também é um mercado global" },
      {
        type: "paragrafo",
        text: "Uma garrafa pode nascer na Borgonha, ser comprada por um distribuidor em Londres, passar por um armazém na Bélgica e terminar numa mesa em São Paulo. No caminho existem moedas, impostos, logística, regulação, seguros, armazenamento, comércio internacional e decisões de preço. Por trás da experiência romântica de abrir uma garrafa existe uma cadeia econômica sofisticada.",
      },
      {
        type: "paragrafo",
        text: "É também por isso que o vinho é tão interessante. Ele pode ser agricultura. Pode ser cultura. Pode ser luxo. Pode ser gastronomia. Pode ser turismo. Pode ser colecionismo. Pode ser negócio. E, em alguns casos, pode até ser ativo. Essa multiplicidade faz dele um ponto de encontro extraordinário para conversas sobre o mundo.",
      },
      { type: "subtitulo", text: "E onde entra o “Cripto”?" },
      {
        type: "paragrafo",
        text: "Não queremos transformar vinho em criptomoeda. Nem transformar cada garrafa em um investimento. O nome Cripto Wine nasce de uma provocação: o que acontece quando colocamos tradição e futuro na mesma mesa?",
      },
      {
        type: "lista",
        items: [
          "Blockchain e autenticidade",
          "Tecnologia e produção",
          "Rastreabilidade e novos modelos de distribuição",
          "Mercado global e tokenização",
          "Colecionismo, comportamento, marcas e luxo",
          "Cultura, viagens, negócios — e, claro, vinho",
        ],
      },
      {
        type: "paragrafo",
        text: "Mas sem tratar tecnologia como solução mágica. E sem tratar tradição como algo intocável.",
      },
      { type: "subtitulo", text: "Conversas que não cabem numa categoria" },
      {
        type: "paragrafo",
        text: "Algumas das histórias mais interessantes acontecem justamente nas fronteiras. Um produtor centenário adotando inteligência artificial. Uma startup tentando combater falsificações de grandes rótulos. Um jovem enólogo recuperando uma variedade esquecida. Uma região tradicional tentando sobreviver às mudanças climáticas. Uma plataforma conectando pequenos produtores diretamente a consumidores do outro lado do mundo. Uma garrafa histórica batendo recordes num leilão.",
      },
      {
        type: "paragrafo",
        text: "Uma tecnologia nova tentando responder a uma pergunta tão antiga quanto o comércio: como sabemos que algo é autêntico? É nesse território que queremos estar.",
      },
      { type: "subtitulo", text: "Pessoas antes de tendências" },
      {
        type: "paragrafo",
        text: "Apesar do nome, o Cripto Wine não será um programa sobre tecnologia. Nem apenas sobre vinho. Será principalmente sobre pessoas: produtores, enólogos, empreendedores, pesquisadores, colecionadores, chefs, sommeliers, criadores e investidores. Pessoas que estão transformando mercados, preservando tradições ou simplesmente fazendo perguntas interessantes.",
      },
      {
        type: "paragrafo",
        text: "Porque inovação sem história raramente produz uma boa conversa. E tradição sem curiosidade corre o risco de virar apenas nostalgia.",
      },
      { type: "subtitulo", text: "Uma mesa aberta" },
      {
        type: "paragrafo",
        text: "O vinho sempre teve esse poder: colocar pessoas diferentes ao redor da mesma mesa. Talvez seja justamente por isso que ele seja um bom ponto de partida para discutir mudanças tão grandes. Não queremos decidir se o futuro será melhor que o passado. Queremos descobrir o que acontece quando os dois se encontram. Com uma garrafa aberta. Algumas perguntas. E disposição para conversar.",
      },
      {
        type: "citacao",
        text: "Cripto Wine. Onde vinho, tecnologia, cultura e mercado se encontram — quando tradição e futuro sentam à mesma mesa.",
      },
    ],
    autor: "Redação Atual",
    data: "2026-08-22T09:00:00.000Z",
    fonte: [],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "O futuro também envelhece em barris | Cripto Wine",
    meta_description:
      "Vinho, tecnologia, cultura e mercado se encontram no manifesto inaugural do Cripto Wine.",
    cta: ctaEditorial("cripto-wine"),
    destaque: true,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
  {
    id: "va-000",
    editoria: "vida-atual",
    categoria: "Manifesto",
    titulo: "Viver melhor também é estar atualizado",
    slug: "viver-melhor-tambem-e-estar-atualizado",
    subtitulo:
      "Nunca tivemos tantos dados sobre saúde, sono, alimentação, movimento e longevidade. E talvez nunca tenha sido tão difícil separar o que realmente importa.",
    resumo:
      "O manifesto inaugural do Vida Atual: wellness, longevidade, comportamento e tecnologia sem promessas fáceis.",
    imagem_principal: vaManifesto,
    imagem_alt: "Pessoas de idades diferentes caminhando e se alongando em um parque pela manhã",
    conteudo: [
      {
        type: "paragrafo",
        text: "Quantos passos você deu hoje? Quanto tempo dormiu? Qual foi sua frequência cardíaca? Quanto tempo passou sentado? Como está sua alimentação? Quando foi sua última atividade física?",
      },
      {
        type: "paragrafo",
        text: "Nunca soubemos tanto sobre o próprio corpo. Relógios medem. Aplicativos registram. Pesquisas avançam. Novas dietas aparecem. Novos tratamentos surgem. Novas promessas também.",
      },
      {
        type: "paragrafo",
        text: "O paradoxo é evidente: quanto mais informação temos sobre como viver melhor, mais difícil parece saber em que informação confiar. É desse paradoxo que nasce o Vida Atual.",
      },
      { type: "subtitulo", text: "Wellness virou uma indústria" },
      {
        type: "paragrafo",
        text: "Durante muito tempo, saúde significava principalmente ausência de doença. Hoje, a conversa é muito maior: sono, movimento, alimentação, saúde mental, longevidade, relacionamentos, trabalho, estresse, tecnologia e qualidade de vida.",
      },
      {
        type: "paragrafo",
        text: "Um mercado inteiro surgiu ao redor dessas preocupações. Aplicativos, wearables, academias, suplementos, clínicas, terapias, alimentos funcionais, programas de longevidade, retiros e plataformas de saúde. Novos negócios aparecem praticamente todos os dias prometendo ajudar alguém a viver melhor. Alguns representam avanços reais. Outros representam apenas uma nova embalagem para ideias antigas. Saber distinguir uma coisa da outra tornou-se parte do desafio.",
      },
      { type: "subtitulo", text: "Viver mais não é a única questão" },
      {
        type: "paragrafo",
        text: "A ciência permitiu ampliar significativamente a expectativa de vida em muitas partes do mundo. Mas uma nova pergunta ganhou importância: como queremos viver esses anos adicionais?",
      },
      {
        type: "lista",
        items: [
          "Mobilidade e autonomia",
          "Cognição e saúde emocional",
          "Relações sociais e propósito",
          "Qualidade do sono e capacidade física",
        ],
      },
      { type: "citacao", text: "Não basta viver mais. Queremos viver melhor." },
      { type: "subtitulo", text: "Tecnologia pode ajudar. Mas não resolve tudo." },
      {
        type: "paragrafo",
        text: "O relógio pode dizer que você dormiu seis horas. Ele não consegue organizar sua rotina por você. Um aplicativo pode contar seus passos. Ele não faz você caminhar. Uma ferramenta pode medir sua frequência cardíaca. Ela não substitui um profissional de saúde quando há um problema. Inteligência artificial pode ampliar o acesso à informação. Mas informação sem contexto também pode confundir.",
      },
      {
        type: "paragrafo",
        text: "O Vida Atual quer olhar para tecnologia com curiosidade, não com deslumbramento. Perguntar: isso realmente melhora a vida? Para quem? Com qual evidência? Com quais limitações?",
      },
      { type: "subtitulo", text: "Menos promessa. Mais contexto." },
      {
        type: "paragrafo",
        text: "O universo do wellness é especialmente fértil em soluções definitivas. A dieta definitiva. O suplemento definitivo. O treino definitivo. O hábito que “muda tudo”. A rotina perfeita. O segredo da longevidade.",
      },
      {
        type: "paragrafo",
        text: "A realidade costuma ser menos espetacular. O corpo humano é complexo. Pessoas são diferentes. Contextos são diferentes. E ciência raramente cabe numa legenda. Por isso, queremos evitar certezas fáceis. Quando houver pesquisa, queremos entender a pesquisa. Quando houver tendência, queremos entender de onde ela veio. Quando houver especialista, queremos saber sua área. Quando houver dúvida, queremos dizer que existe dúvida.",
      },
      { type: "subtitulo", text: "Saúde é também comportamento" },
      {
        type: "paragrafo",
        text: "Sabemos muito sobre o que seria bom fazer: dormir melhor, mover o corpo, comer de forma equilibrada, diminuir o estresse, construir relações. Mas saber não significa fazer. É aí que comportamento se torna tão interessante quanto biologia.",
      },
      {
        type: "lista",
        items: [
          "Por que criamos hábitos? Por que abandonamos alguns?",
          "Por que uma tecnologia ajuda uma pessoa e atrapalha outra?",
          "Como o ambiente influencia nossas escolhas?",
          "O que trabalho, cidades, telas e redes sociais estão fazendo com nossa qualidade de vida?",
        ],
      },
      {
        type: "paragrafo",
        text: "São questões de saúde. Mas também são questões culturais, econômicas e sociais.",
      },
      { type: "subtitulo", text: "O mundo também muda a maneira como vivemos" },
      {
        type: "paragrafo",
        text: "Trabalho remoto. Inteligência artificial. Envelhecimento populacional. Mudanças nas cidades. Novos modelos de família. Viagens. Mudanças climáticas. Novos medicamentos. Novos alimentos. Novas formas de exercício. A vida contemporânea está transformando aquilo que entendemos por bem-estar.",
      },
      {
        type: "paragrafo",
        text: "Por isso o nome: Vida Atual. Não porque exista uma maneira “moderna” correta de viver. Mas porque entender o nosso tempo ajuda a entender algumas das escolhas que fazemos dentro dele.",
      },
      { type: "subtitulo", text: "O que queremos investigar" },
      {
        type: "paragrafo",
        text: "O Vida Atual vai acompanhar temas como wellness, longevidade, movimento, sono, alimentação, saúde mental, comportamento, tecnologia, trabalho, qualidade de vida, envelhecimento e tendências internacionais.",
      },
      {
        type: "paragrafo",
        text: "Sempre com um princípio importante: o conteúdo editorial não substitui orientação profissional individual. Nosso papel é ajudar a compreender ideias, pesquisas, tendências e mudanças. Não diagnosticar. Não prescrever. Não vender soluções milagrosas.",
      },
      { type: "subtitulo", text: "Estar atualizado não significa correr atrás de tudo" },
      {
        type: "paragrafo",
        text: "Talvez essa seja a ideia mais importante deste projeto. Ser atual não é adotar cada novidade. Não é comprar cada tecnologia. Não é seguir cada tendência. Às vezes, estar atualizado significa justamente saber o que ignorar. Entender melhor. Escolher melhor. Fazer perguntas melhores.",
      },
      {
        type: "paragrafo",
        text: "E reconhecer que algumas das coisas mais importantes para a qualidade de vida continuam surpreendentemente simples: movimento, sono, relações, tempo, natureza e propósito. O futuro certamente vai trazer novas ferramentas. Mas nossa pergunta continuará sendo a mesma: isso nos ajuda a viver melhor?",
      },
      {
        type: "citacao",
        text: "Vida Atual. Informação para viver melhor em um mundo que muda rápido.",
      },
    ],
    autor: "Redação Atual",
    data: "2026-08-22T09:00:00.000Z",
    fonte: [],
    video_url: null,
    audio_url: null,
    imagem_social: null,
    seo_title: "Viver melhor também é estar atualizado | Vida Atual",
    meta_description:
      "O manifesto inaugural do Vida Atual sobre wellness, longevidade, comportamento, tecnologia e qualidade de vida.",
    cta: ctaEditorial("vida-atual"),
    destaque: true,
    status: "publicado",
    created_at: now,
    updated_at: now,
  },
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
    destaque: false,
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
