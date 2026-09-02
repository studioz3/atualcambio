import type { LegalBlock } from "@/components/atual/LegalPage";

export const intro: string[] = [
  "O nosso canal de segunda instância para garantir os seus direitos.",
  "A Ouvidoria da Atual Câmbio é um canal de comunicação de segunda instância, imparcial e independente, criado para mediar conflitos e garantir a defesa dos direitos dos nossos clientes.",
  "Trabalhamos em total conformidade com as diretrizes do Banco Central do Brasil para assegurar que sua voz seja ouvida e respeitada.",
  "Este canal deve ser acionado apenas se você já entrou em contato com os nossos canais primários de atendimento (SAC, Lojas Físicas ou Central de Relacionamento) e a solução apresentada não foi satisfatória, ou se o prazo informado expirou sem retorno."
];

export const blocks: LegalBlock[] = [
  {
    "id": "como-acionar-a-ouvidoria",
    "title": "Como acionar a Ouvidoria?",
    "body": [
      {
        "type": "p",
        "text": "Para que possamos analisar o seu caso de forma ágil, é obrigatório ter em mãos o número de protocolo do seu atendimento anterior."
      },
      {
        "type": "p",
        "text": "Siga os passos:"
      },
      {
        "type": "ul",
        "items": [
          "Fale com o SAC: Entre em contato com a nossa Central de Atendimento primária.",
          "Anote o Protocolo: Guarde o número de protocolo gerado no seu atendimento.",
          "Acione a Ouvidoria: Se a resposta do SAC não resolver o seu problema, entre em contato com a Ouvidoria informando o seu número de protocolo para uma reavaliação do caso."
        ]
      }
    ]
  },
  {
    "id": "prazos-de-atendimento",
    "title": "Prazos de Atendimento",
    "body": [
      {
        "type": "p",
        "text": "Cumprindo rigorosamente a regulamentação do Banco Central, a Ouvidoria da Atual Câmbio tem o prazo máximo de 10 (dez) dias úteis para analisar sua solicitação, apurar os fatos internamente e enviar uma resposta conclusiva e transparente."
      },
      {
        "type": "p",
        "text": "Excepcionalmente, quando a complexidade do caso exigir apuração adicional, esse prazo poderá ser prorrogado uma única vez, por até 10 (dez) dias úteis. Nessa hipótese, você será comunicado antes do vencimento do prazo original, com a justificativa do motivo da prorrogação e a nova data prevista para a resposta conclusiva."
      }
    ]
  },

  {
    "id": "canais-de-contato-da-ouvidoria",
    "title": "Canais de Contato da Ouvidoria",
    "body": [
      {
        "type": "p",
        "text": "Nossa equipe está pronta para atender você de forma gratuita:"
      },
      {
        "type": "ul",
        "items": [
          "Telefone (0800): 0800 770-5422 — ligação gratuita de telefones fixos e celulares.",
          "Horário de funcionamento: de segunda a sexta-feira, das 9h às 18h, exceto feriados nacionais.",
          "E-mail: ouvidoria@atualcambio.com.br",
          "Atendimento presencial: Atual Câmbio — Av. Cassiano Ricardo, 601, Sala 25, Edifício The One, Jardim Aquarius, CEP 12246-870, São José dos Campos-SP."
        ]
      },
      {
        "type": "p",
        "text": "Atenção: se este é o seu primeiro contato com a Atual Câmbio para tirar dúvidas, realizar cotações, relatar um problema ou fazer uma reclamação inicial, fale antes com a nossa Central de Atendimento pelo e-mail contato@atualcambio.com.br ou pelo telefone 0800 770-5422."
      }
    ]
  }
];
