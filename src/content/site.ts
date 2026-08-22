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
  account: "https://finance.atualcambio.com.br",
  openAccount: "#abrir-conta", // [AGUARDANDO API ONZ] onboarding no app
  appStore: "https://apps.apple.com/br/app/atual-c%C3%A2mbio/id6764897842?l=en-GB",
  googlePlay:
    "https://play.google.com/store/apps/details?id=finance.onz.atual.cambio&hl=pt_BR",

  whatsapp: null as string | null, // [AGUARDANDO VALIDAÇÃO] número oficial
};

export const nav = [
  {
    label: "Soluções",
    to: "/solucoes",
    items: [
      { label: "Remessas internacionais", to: "/solucoes", hash: "remessas" },
      { label: "USDT / USDC", to: "/stablecoins" },
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

export const trustBar = [
  "Autorizada pelo Banco Central",
  "Atendimento especializado",
  "Pessoas e empresas",
];

export const pillars = [
  {
    id: "seguranca",
    title: "Segurança",
    text: "Instituição autorizada e regulada pelo Banco Central, com processos estruturados de compliance e segurança.",
  },
  {
    id: "tecnologia",
    title: "Tecnologia",
    text: "Plataforma digital para simplificar e agilizar suas operações.",
  },
  {
    id: "atendimento",
    title: "Atendimento",
    text: "Especialistas para orientar quando sua operação precisar de acompanhamento.",
  },
] as const;

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
    q: "Qual a diferença entre dólar comercial e dólar turismo?",
    a: "O dólar comercial é a referência usada em operações entre empresas e instituições, como importação, exportação e pagamentos internacionais. O dólar turismo se refere à moeda destinada a viagens, incluindo espécie. São mercados diferentes, com custos e finalidades diferentes.",
  },
  {
    q: "A Atual entrega moeda estrangeira?",
    a: "Sim. A Atual atende operações de câmbio turismo, incluindo moeda em espécie. A disponibilidade por moeda e a forma de retirada ou entrega são confirmadas pelo especialista durante o atendimento.",
  },
  {
    q: "Como funciona a cotação?",
    a: "A cotação é apresentada no momento da operação e considera a moeda, o valor e a finalidade. Informações exibidas no site têm caráter informativo e sempre acompanham o horário de atualização.",
  },
  {
    q: "Posso enviar dinheiro para o exterior?",
    a: "Sim. A Atual opera remessas internacionais para pessoas físicas e empresas, após cadastro, identificação e verificação da finalidade da operação.",
  },
  {
    q: "Quanto tempo leva uma remessa internacional?",
    a: "O prazo depende da moeda, do país de destino, do banco recebedor e do horário de fechamento da operação. O especialista informa a estimativa aplicável ao seu caso antes do envio.",
  },
  {
    q: "A Atual atende empresas?",
    a: "Sim. A Atual atende empresas em importação, exportação, pagamentos e recebimentos internacionais, com acompanhamento consultivo e apoio na documentação exigida.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual é autorizada a operar no mercado de câmbio brasileiro, sujeita à regulação e supervisão do Banco Central do Brasil, e é associada à ABRACAM.",
  },
  {
    q: "Quais documentos podem ser necessários?",
    a: "A documentação varia conforme o tipo de operação, o valor e o perfil do cliente. Um especialista indica exatamente o que é necessário antes de qualquer envio de documento.",
  },
  {
    q: "Posso comprar e vender USDT e USDC?",
    a: "Sim. As operações com USDT e USDC seguem o mesmo padrão de identificação, conformidade e atendimento das demais operações da Atual.",
  },
  {
    q: "Como abro minha Conta Atual?",
    a: "A abertura é feita pelo aplicativo da Atual, com cadastro e identificação. Se preferir, um especialista acompanha você durante o processo.",
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
