import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalBlock } from "@/components/atual/LegalPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e LGPD | Atual Câmbio" },
      {
        name: "description",
        content:
          "Como a Atual Câmbio trata dados pessoais: finalidades, bases legais, compartilhamento, retenção, segurança e direitos do titular conforme a LGPD.",
      },
      { property: "og:title", content: "Privacidade e LGPD | Atual Câmbio" },
      {
        property: "og:description",
        content: "Tratamento de dados pessoais com finalidade definida, acesso controlado e conformidade com a LGPD.",
      },
    ],
  }),
  component: PrivacidadePage,
});

const blocks: LegalBlock[] = [
  {
    id: "escopo",
    title: "1. Escopo desta política",
    paragraphs: [
      "Esta política descreve como a Atual Câmbio trata dados pessoais coletados neste site, no aplicativo e nos canais de atendimento, no contexto de operações de câmbio e serviços correlatos.",
      "O tratamento observa a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e as normas aplicáveis ao mercado de câmbio brasileiro.",
    ],
  },
  {
    id: "dados",
    title: "2. Dados que coletamos",
    paragraphs: ["Coletamos apenas os dados necessários para cada finalidade:"],
    items: [
      "Dados de contato informados voluntariamente em formulários (nome, e-mail, telefone e perfil pessoa física ou jurídica).",
      "Dados cadastrais e documentais exigidos para identificação do cliente e para a execução de operações reguladas.",
      "Dados de navegação e uso, como páginas acessadas e interações, coletados por cookies e ferramentas de análise.",
    ],
  },
  {
    id: "finalidades",
    title: "3. Finalidades e bases legais",
    paragraphs: [
      "Utilizamos dados pessoais para responder solicitações de atendimento, executar contratos e operações contratadas, cumprir obrigações legais e regulatórias — incluindo identificação do cliente e prevenção à lavagem de dinheiro — e para o legítimo interesse de melhorar a experiência do site.",
      "Cada tratamento é sustentado por uma base legal específica da LGPD, sem uso de dados para finalidades incompatíveis com aquelas informadas no momento da coleta.",
    ],
  },
  {
    id: "compartilhamento",
    title: "4. Compartilhamento",
    paragraphs: [
      "Dados podem ser compartilhados com autoridades e órgãos reguladores quando exigido por lei, com instituições parceiras necessárias à liquidação das operações e com fornecedores de tecnologia que atuam como operadores, sob obrigações contratuais de confidencialidade e segurança.",
      "Não comercializamos dados pessoais.",
    ],
  },
  {
    id: "retencao",
    title: "5. Retenção",
    paragraphs: [
      "Os dados são mantidos pelo período necessário ao cumprimento das finalidades informadas e dos prazos legais e regulatórios aplicáveis a instituições autorizadas a operar no mercado de câmbio. Encerrado esse período, os dados são eliminados ou anonimizados.",
    ],
  },
  {
    id: "seguranca",
    title: "6. Segurança da informação",
    paragraphs: [
      "Adotamos controles técnicos e organizacionais para proteger dados pessoais, incluindo controle de acesso por necessidade, registro de atividades, monitoramento de operações e políticas internas de compliance.",
      "Nenhuma informação sensível de operação é solicitada por canais não oficiais. Documentos só devem ser enviados após orientação de um especialista da Atual.",
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies e medição",
    paragraphs: [
      "Utilizamos cookies essenciais ao funcionamento do site e cookies de análise para entender o uso das páginas e melhorar a navegação. Você pode gerenciar ou bloquear cookies nas configurações do seu navegador, ciente de que isso pode afetar funcionalidades.",
    ],
  },
  {
    id: "direitos",
    title: "8. Direitos do titular",
    paragraphs: [
      "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, informação sobre compartilhamentos e revogação de consentimento, quando aplicável.",
      "As solicitações são atendidas nos prazos previstos na LGPD, respeitadas as obrigações legais de guarda de registros.",
    ],
  },
  {
    id: "encarregado",
    title: "9. Encarregado (DPO) e contato",
    paragraphs: [
      "Para exercer direitos ou esclarecer dúvidas sobre privacidade, utilize os canais oficiais de atendimento da Atual Câmbio.",
      "[AGUARDANDO VALIDAÇÃO] nome do encarregado, e-mail do DPO e canal formal de requisições do titular.",
    ],
  },
];

function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade e LGPD"
      title="Como tratamos os seus dados pessoais"
      intro="Transparência sobre quais dados coletamos, por que coletamos, com quem compartilhamos e como você exerce os seus direitos."
      updatedNote="[AGUARDANDO VALIDAÇÃO] data da última atualização e revisão jurídica deste documento."
      blocks={blocks}
      footnote="Este texto é uma versão preliminar para estruturação do site e deve ser revisado e aprovado pelas áreas jurídica e de compliance antes da publicação."
    />
  );
}
