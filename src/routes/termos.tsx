import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalBlock } from "@/components/atual/LegalPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | Atual Câmbio" },
      {
        name: "description",
        content:
          "Condições de uso do site e dos canais digitais da Atual Câmbio: elegibilidade, cotações informativas, conta digital, compliance e responsabilidades.",
      },
      { property: "og:title", content: "Termos de Uso | Atual Câmbio" },
      {
        property: "og:description",
        content: "Regras de uso do site e dos canais digitais da Atual Câmbio, dentro do ambiente regulado de câmbio.",
      },
    ],
  }),
  component: TermosPage,
});

const blocks: LegalBlock[] = [
  {
    id: "aceite",
    title: "1. Aceite",
    paragraphs: [
      "Ao navegar neste site ou utilizar os canais digitais da Atual Câmbio, você concorda com estes Termos de Uso. Se não concordar, interrompa o uso.",
    ],
  },
  {
    id: "objeto",
    title: "2. Objeto",
    paragraphs: [
      "Este site apresenta informações institucionais e sobre soluções de câmbio, remessas internacionais, operações com stablecoins e câmbio turismo. A contratação de qualquer operação depende de cadastro, identificação do cliente e análise de conformidade.",
    ],
  },
  {
    id: "elegibilidade",
    title: "3. Elegibilidade e cadastro",
    paragraphs: [
      "O uso dos serviços é destinado a pessoas físicas e jurídicas com capacidade legal para contratar. Você se compromete a fornecer informações verdadeiras, completas e atualizadas, e a mantê-las assim.",
      "A Atual pode recusar, suspender ou encerrar relacionamento quando houver inconsistência cadastral, impossibilidade de identificação ou indício de descumprimento normativo.",
    ],
  },
  {
    id: "cotacoes",
    title: "4. Cotações e informações",
    paragraphs: [
      "Valores, taxas e indicadores exibidos no site têm caráter meramente informativo e não constituem oferta vinculante. A cotação aplicável é aquela apresentada e confirmada no momento da operação, considerando moeda, valor e finalidade.",
      "Conteúdos editoriais são informativos e não configuram recomendação de investimento ou aconselhamento financeiro, tributário ou jurídico.",
    ],
  },
  {
    id: "conta",
    title: "5. Conta Atual e credenciais",
    paragraphs: [
      "O acesso à plataforma digital é pessoal e intransferível. Você é responsável por manter a confidencialidade das suas credenciais e por todas as operações realizadas com elas.",
      "Suspeitas de acesso indevido devem ser comunicadas imediatamente pelos canais oficiais de atendimento.",
    ],
  },
  {
    id: "conduta",
    title: "6. Uso adequado",
    paragraphs: ["É vedado utilizar o site, o aplicativo ou os canais de atendimento para:"],
    items: [
      "Praticar ou facilitar fraude, lavagem de dinheiro, financiamento ao terrorismo ou qualquer atividade ilícita.",
      "Prestar informações falsas, omitir a real finalidade da operação ou atuar em nome de terceiro sem a devida identificação.",
      "Tentar acessar sistemas, dados ou áreas restritas sem autorização, ou interferir na disponibilidade dos serviços.",
    ],
  },
  {
    id: "compliance",
    title: "7. Compliance e regulação",
    paragraphs: [
      "As operações são conduzidas no ambiente regulado do mercado de câmbio brasileiro, observadas as normas do Banco Central do Brasil e as políticas internas de conhecimento do cliente, prevenção à lavagem de dinheiro e monitoramento de operações.",
      "Operações podem ser submetidas a análise adicional, exigir documentação complementar ou ser recusadas em razão de exigências legais e regulatórias.",
    ],
  },
  {
    id: "propriedade",
    title: "8. Propriedade intelectual",
    paragraphs: [
      "Marca, logotipo, textos, imagens, layout e demais elementos deste site pertencem à Atual Câmbio ou a seus licenciantes, sendo vedada a reprodução sem autorização prévia por escrito.",
    ],
  },
  {
    id: "responsabilidade",
    title: "9. Disponibilidade e responsabilidade",
    paragraphs: [
      "Empregamos esforços para manter o site disponível e as informações corretas, mas o serviço pode sofrer interrupções por manutenção, indisponibilidade de terceiros ou eventos fora do nosso controle.",
      "A Atual não se responsabiliza por decisões tomadas exclusivamente com base em conteúdos informativos publicados neste site.",
    ],
  },
  {
    id: "privacidade-link",
    title: "10. Privacidade",
    paragraphs: [
      "O tratamento de dados pessoais é descrito na Política de Privacidade e LGPD, que integra estes Termos de Uso.",
    ],
  },
  {
    id: "alteracoes",
    title: "11. Alterações e foro",
    paragraphs: [
      "Estes Termos podem ser atualizados a qualquer momento, passando a valer a partir da publicação nesta página.",
      "[AGUARDANDO VALIDAÇÃO] razão social, CNPJ, endereço, legislação aplicável e foro eleito.",
    ],
  },
];

function TermosPage() {
  return (
    <LegalPage
      eyebrow="Termos de Uso"
      title="Condições de uso do site e dos canais digitais"
      intro="As regras que orientam o uso deste site, da Conta Atual e do atendimento — dentro do ambiente regulado do mercado de câmbio."
      updatedNote="[AGUARDANDO VALIDAÇÃO] data da última atualização e revisão jurídica deste documento."
      blocks={blocks}
      footnote="Este texto é uma versão preliminar para estruturação do site e deve ser revisado e aprovado pelas áreas jurídica e de compliance antes da publicação."
    />
  );
}
