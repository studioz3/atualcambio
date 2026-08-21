import type { LegalBlock } from "@/components/atual/LegalPage";

export const intro: string[] = [
  "Como a Atual Câmbio utiliza cookies e tecnologias semelhantes no site e nos canais digitais.",
  "Esta Política de Cookies complementa a nossa Política de Privacidade e está alinhada à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
];

export const blocks: LegalBlock[] = [
  {
    id: "1-o-que-sao-cookies",
    title: "1. O que são cookies",
    body: [
      {
        type: "p",
        text: "Cookies são pequenos arquivos gravados no seu navegador quando você acessa um site. Eles permitem reconhecer o dispositivo, manter a sessão ativa, lembrar preferências e medir o desempenho das páginas. Também utilizamos tecnologias semelhantes, como pixels e armazenamento local (localStorage).",
      },
    ],
  },
  {
    id: "2-categorias-utilizadas",
    title: "2. Categorias que utilizamos",
    body: [
      {
        type: "ul",
        items: [
          "Necessários: essenciais para o funcionamento, a segurança e a prevenção a fraudes. Não podem ser desativados e não dependem de consentimento.",
          "Desempenho e análise: medem uso, erros e tempo de navegação para melhorar a experiência do site.",
          "Marketing e comunicação: mensuram campanhas e ajudam a apresentar conteúdos mais relevantes sobre soluções de câmbio.",
        ],
      },
      {
        type: "p",
        text: "Cookies de desempenho e de marketing só são ativados após o seu consentimento no banner de cookies.",
      },
    ],
  },
  {
    id: "3-base-legal",
    title: "3. Base legal do tratamento",
    body: [
      {
        type: "p",
        text: "Os cookies necessários são tratados com base no legítimo interesse e no cumprimento de obrigações legais e regulatórias aplicáveis a instituições autorizadas pelo Banco Central do Brasil. As demais categorias são tratadas com base no seu consentimento, que pode ser revogado a qualquer momento.",
      },
    ],
  },
  {
    id: "4-gerenciar-preferencias",
    title: "4. Como gerenciar suas preferências",
    body: [
      {
        type: "ul",
        items: [
          "Use o botão “Gerenciar preferências de cookies” no fim desta página para revisar ou alterar suas escolhas.",
          "Ajuste ou apague cookies diretamente nas configurações do seu navegador.",
          "A recusa de cookies opcionais não impede o uso do site, mas pode reduzir a personalização e a qualidade das medições.",
        ],
      },
      {
        type: "p",
        text: "Suas preferências ficam registradas no seu navegador. Ao limpar os dados do navegador, o banner será exibido novamente.",
      },
    ],
  },
  {
    id: "5-retencao-e-terceiros",
    title: "5. Retenção e terceiros",
    body: [
      {
        type: "p",
        text: "Cookies de sessão são eliminados ao fechar o navegador; cookies persistentes permanecem pelo prazo necessário à finalidade para a qual foram criados. Podemos utilizar ferramentas de terceiros de análise e de mensuração de campanhas, que tratam dados conforme suas próprias políticas e apenas dentro do escopo autorizado por você.",
      },
    ],
  },
  {
    id: "6-seus-direitos-e-contato",
    title: "6. Seus direitos e contato",
    body: [
      {
        type: "p",
        text: "Nos termos da LGPD, você pode solicitar acesso, correção, portabilidade, eliminação de dados e revogação do consentimento. Fale com a Atual Câmbio pelo e-mail contato@atualcambio.com.br ou pelo telefone 0800 770-5422. Para mais detalhes sobre o tratamento de dados pessoais, consulte a Política de Privacidade.",
      },
    ],
  },
];
