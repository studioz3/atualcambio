/**
 * Conteúdo do site — separado dos componentes.
 * Nada aqui deve conter cotação, prazo ou dado institucional inventado.
 *
 * [AGUARDANDO API ONZ] cotações, deeplinks do app, onboarding e identificação de cliente.
 * [AGUARDANDO VALIDAÇÃO] número de WhatsApp oficial, links de App Store / Google Play,
 * endereços, CNPJ e textos regulatórios.
 */

export const brand = {
  name: "Atual Câmbio",
  positioning: "Se você pensa global, você é Atual.",
  valueProp:
    "Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação.",
  explanation:
    "Atendimento consultivo com tecnologia para simplificar e agilizar as operações, sempre com segurança.",
};

/** [AGUARDANDO VALIDAÇÃO] destinos externos ainda não confirmados */
export const links = {
  account: "#conta-atual", // [AGUARDANDO API ONZ] deeplink de login
  openAccount: "#abrir-conta", // [AGUARDANDO API ONZ] onboarding no app
  appStore: "#app-store", // [AGUARDANDO VALIDAÇÃO]
  googlePlay: "#google-play", // [AGUARDANDO VALIDAÇÃO]
  whatsapp: null as string | null, // [AGUARDANDO VALIDAÇÃO] número oficial
};

export const nav = [
  {
    label: "Soluções",
    to: "/solucoes",
    items: [
      { label: "Remessas internacionais", to: "/solucoes", hash: "remessas" },
      { label: "USDT / USDC", to: "/solucoes", hash: "stablecoins" },
      { label: "Câmbio turismo", to: "/solucoes", hash: "turismo" },
      { label: "Conta Atual", to: "/solucoes", hash: "conta" },
    ],
  },
  { label: "Para empresas", to: "/empresas" },
  { label: "Cotações", to: "/cotacoes" },
  { label: "Conteúdo", to: "/conteudo" },
  { label: "A Atual", to: "/a-atual" },
] as const;

export const intents = [
  {
    title: "Quero importar ou pagar fornecedor",
    description: "Pagamentos ao exterior com acompanhamento de um especialista.",
    to: "/empresas",
    event: "intent_import",
  },
  {
    title: "Quero enviar dinheiro",
    description: "Remessas para pessoas e famílias no exterior, do jeito simples.",
    to: "/solucoes",
    event: "remittance_start",
  },
  {
    title: "Quero comprar USDT",
    description: "Stablecoins com processo claro e liquidação transparente.",
    to: "/solucoes",
    event: "stablecoin_buy",
  },
  {
    title: "Quero viajar",
    description: "Moeda em espécie e soluções de câmbio turismo.",
    to: "/solucoes",
    event: "intent_travel",
  },
];

export const solutions = [
  {
    id: "remessas",
    title: "Remessas internacionais",
    summary:
      "Envio e recebimento de valores no exterior para pessoas e empresas, com orientação em cada etapa.",
    bullets: [
      "Pagamento a fornecedores e prestadores no exterior",
      "Envio para familiares, estudos e manutenção de residentes",
      "Recebimento de valores do exterior",
    ],
  },
  {
    id: "stablecoins",
    title: "USDT e USDC",
    summary:
      "Operações com stablecoins dentro de um ambiente regulado, com o mesmo padrão de atendimento do câmbio tradicional.",
    bullets: [
      "Compra e venda de USDT e USDC",
      "Processo com identificação e conformidade",
      "Acompanhamento consultivo quando necessário",
    ],
  },
  {
    id: "turismo",
    title: "Câmbio turismo",
    summary: "Moeda para viagem com atendimento humano e orientação sobre a melhor combinação.",
    bullets: ["Moeda em espécie", "Orientação sobre limites e documentação", "Atendimento presencial e digital"],
  },
  {
    id: "conta",
    title: "Conta Atual",
    summary:
      "A plataforma digital da Atual: autonomia para operar quando você quiser, com especialista a um toque.",
    bullets: [
      "Abertura de conta pelo app",
      "Operações digitais",
      "Histórico e comprovantes em um só lugar",
    ],
  },
];

export const trust = [
  "Instituição autorizada a operar no mercado de câmbio",
  "Compliance e prevenção à lavagem de dinheiro",
  "Atendimento consultivo por especialistas",
];

export const security = [
  {
    title: "Regulação",
    text: "Operações conduzidas no ambiente regulado do mercado de câmbio brasileiro, conforme normas do Banco Central do Brasil.",
  },
  {
    title: "Compliance",
    text: "Políticas de conhecimento do cliente, prevenção à lavagem de dinheiro e monitoramento de operações.",
  },
  {
    title: "Privacidade",
    text: "Tratamento de dados pessoais conforme a LGPD, com finalidade definida e acesso controlado.",
  },
];

export const faq = [
  {
    q: "Quem pode operar com a Atual?",
    a: "Pessoas físicas e empresas que precisem enviar, receber ou converter valores em moeda estrangeira, após o processo de cadastro e identificação.",
  },
  {
    q: "Preciso ir até uma loja para operar?",
    a: "Não necessariamente. A Conta Atual permite operar de forma digital. O atendimento presencial e consultivo continua disponível quando você preferir orientação.",
  },
  {
    q: "Quais documentos são necessários?",
    a: "A documentação depende do tipo de operação e do perfil do cliente. Um especialista indica exatamente o que é necessário antes de qualquer envio de documento.",
  },
  {
    q: "Como funciona a cotação?",
    a: "A cotação é apresentada no momento da operação e considera a moeda, o valor e a finalidade. Os valores exibidos no site são informativos e sempre acompanhados do horário de atualização.",
  },
  {
    q: "A Atual opera com stablecoins?",
    a: "Sim. As operações com USDT e USDC seguem o mesmo padrão de identificação, conformidade e atendimento das demais operações.",
  },
];

export const editorial = [
  {
    category: "Momento Atual",
    title: "O que observar no câmbio antes de fechar uma operação",
    date: "Conteúdo editorial",
    excerpt:
      "Como estruturar decisões de câmbio com informação, calendário e objetivo — sem depender de palpite.",
  },
  {
    category: "Comércio exterior",
    title: "Pagamentos internacionais: o que muda para a sua empresa",
    date: "Conteúdo editorial",
    excerpt: "Documentação, prazos operacionais e o papel do especialista no fluxo de importação.",
  },
  {
    category: "Stablecoins",
    title: "USDT e USDC dentro de um ambiente regulado",
    date: "Conteúdo editorial",
    excerpt: "O que diferencia uma operação com stablecoin conduzida por uma instituição de câmbio.",
  },
];

/** [AGUARDANDO API ONZ] — sem cotação real, nenhum número é exibido. */
export const quotePairs = [
  { code: "USD", name: "Dólar americano" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "USDT", name: "Tether" },
  { code: "USDC", name: "USD Coin" },
];
