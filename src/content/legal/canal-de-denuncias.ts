import type { LegalBlock } from "@/components/atual/LegalPage";

export const intro: string[] = [
  "Nosso compromisso com a ética, a transparência e a integridade.",
  "A Atual Câmbio preza pela ética e pela estrita conformidade com as leis e regulamentações do Banco Central do Brasil e demais órgãos reguladores.",
  "Este Canal de Denúncias é um ambiente seguro, sigiloso e independente, disponibilizado para que clientes, parceiros, fornecedores e colaboradores possam relatar, de forma segura, condutas que violem nosso Código de Ética ou a legislação vigente."
];

export const blocks: LegalBlock[] = [
  {
    "id": "o-que-devo-relatar-neste-canal",
    "title": "O que devo relatar neste canal?",
    "body": [
      {
        "type": "p",
        "text": "Utilize este canal exclusivamente para denunciar situações graves, como:"
      },
      {
        "type": "ul",
        "items": [
          "Indícios de fraudes financeiras ou operacionais.",
          "Suspeitas de Lavagem de Dinheiro ou Financiamento ao Terrorismo (PLD/FT).",
          "Casos de corrupção, suborno ou favorecimento ilícito.",
          "Assédio moral, sexual ou qualquer forma de discriminação.",
          "Vazamento de informações sigilosas ou infrações à Lei Geral de Proteção de Dados (LGPD).",
          "Outras violações ao nosso Código de Conduta Ética ou às normas do Banco Central."
        ]
      },
      {
        "type": "p",
        "text": "Importante: Este canal não é destinado a reclamações sobre atendimento, dúvidas sobre cotações ou problemas operacionais de rotina. Para esses casos, acesse nosso Fale Conosco ou, em segunda instância, a nossa Ouvidoria."
      }
    ]
  },
  {
    "id": "confidencialidade-e-anonimato-garantidos",
    "title": "Confidencialidade e Anonimato Garantidos",
    "body": [
      {
        "type": "p",
        "text": "A Atual Câmbio assegura que todas as denúncias são tratadas com o mais absoluto sigilo. Você tem a opção de se identificar ou de fazer a denúncia de forma 100% anônima."
      },
      {
        "type": "p",
        "text": "Garantimos a proteção do denunciante de boa-fé, sendo estritamente proibida qualquer forma de retaliação contra quem utilizar este canal para reportar uma suspeita."
      },
      {
        "type": "p",
        "text": "As informações serão recebidas e apuradas por um comitê independente e imparcial."
      }
    ]
  },
  {
    "id": "como-fazer-sua-denuncia",
    "title": "Como fazer sua denúncia",
    "body": [
      {
        "type": "p",
        "text": "Para que a investigação seja eficaz, pedimos que forneça o máximo de detalhes possível (o que aconteceu, quem está envolvido, quando e onde ocorreu) e anexe evidências, se houver."
      },
      {
        "type": "p",
        "text": "Envie sua denúncia pelos canais abaixo, com o máximo de detalhes possível:"
      },
      {
        "type": "p",
        "text": "E-mail Direto (Sigiloso): denuncias@atualcambio.com.br"
      },
      {
        "type": "p",
        "text": "Telefone: 0800 770-5422"
      },
      {
        "type": "p",
        "text": "Ao registrar o relato, você receberá um número de protocolo para acompanhar o andamento da apuração, mesmo que tenha optado pelo anonimato."
      }
    ]
  }
];
