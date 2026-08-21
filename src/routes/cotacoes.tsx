import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, Eyebrow, SectionHeading } from "@/components/atual/primitives";
import { QuoteBoard } from "@/components/atual/QuoteBoard";
import { SpecialistCta } from "@/components/atual/blocks";

export const Route = createFileRoute("/cotacoes")({
  head: () => ({
    meta: [
      { title: "Cotações | Atual Câmbio" },
      {
        name: "description",
        content:
          "Acompanhe as moedas operadas pela Atual. Exibimos cotação apenas com dados reais e horário de atualização.",
      },
      { property: "og:title", content: "Cotações | Atual Câmbio" },
      {
        property: "og:description",
        content: "Moedas e stablecoins operadas pela Atual, sempre com o horário da atualização.",
      },
    ],
  }),
  component: Cotacoes,
});

function Cotacoes() {
  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-2xl py-20 md:py-28">
            <Eyebrow>Cotações</Eyebrow>
            <h1 className="font-display mt-6 text-[34px] leading-[1.08] font-bold text-white md:text-[52px]">
              Números só quando são reais
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">
              A cotação final considera moeda, valor e finalidade da operação. Enquanto a integração de
              dados não estiver ativa, nenhum valor é exibido.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Moedas"
          title="Moedas e stablecoins operadas pela Atual"
          description="Cada card mostrará compra, venda e o horário exato da atualização assim que a integração estiver disponível."
        />
        <div className="mt-12">
          <QuoteBoard />
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          [AGUARDANDO API ONZ] cotação de moedas, USDT e USDC, e carimbo de atualização.
        </p>
      </Section>

      <SpecialistCta
        context="Cotações"
        title="Quer a cotação da sua operação?"
        description="Um especialista apresenta as condições considerando moeda, valor e finalidade."
      />
    </>
  );
}
