import { createFileRoute } from "@tanstack/react-router";
import globalImg from "@/assets/global.jpg";
import { Container, Section, Eyebrow } from "@/components/atual/primitives";
import { SpecialistCta } from "@/components/atual/blocks";
import { editorial } from "@/content/site";

export const Route = createFileRoute("/conteudo")({
  head: () => ({
    meta: [
      { title: "Momento Atual | Conteúdo da Atual Câmbio" },
      {
        name: "description",
        content:
          "Leituras sobre câmbio, comércio exterior e stablecoins para decidir com contexto — sem palpite de mercado.",
      },
      { property: "og:title", content: "Momento Atual | Conteúdo da Atual Câmbio" },
      {
        property: "og:description",
        content: "Câmbio, comércio exterior e stablecoins explicados com contexto.",
      },
    ],
  }),
  component: Conteudo,
});

function Conteudo() {
  const [featured, ...rest] = editorial;

  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-2xl py-20 md:py-28">
            <Eyebrow>Momento Atual</Eyebrow>
            <h1 className="font-display mt-6 text-[34px] leading-[1.08] font-bold text-white md:text-[52px]">
              Conteúdo para entender antes de decidir
            </h1>
          </div>
        </Container>
      </section>

      <Section tone="light">
        {featured ? (
          <article className="grid items-center gap-10 lg:grid-cols-2">
            <img
              src={globalImg}
              alt="Vista de uma cidade global a partir de um terminal de aeroporto"
              width={1400}
              height={900}
              loading="lazy"
              className="aspect-[16/10] w-full rounded-xl object-cover"
            />
            <div>
              <Eyebrow>{featured.category}</Eyebrow>
              <h2 className="font-display mt-4 text-[28px] leading-[1.12] font-bold text-navy md:text-[36px]">
                {featured.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
              <p className="mt-6 text-xs text-muted-foreground">{featured.date}</p>
            </div>
          </article>
        ) : null}

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          {rest.map((item) => (
            <article key={item.title}>
              <div className="aspect-[16/10] rounded-xl bg-line" aria-hidden />
              <Eyebrow>{item.category}</Eyebrow>
              <h3 className="mt-3 text-xl leading-snug font-semibold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{item.date}</p>
            </article>
          ))}
        </div>

        {/* [AGUARDANDO VALIDAÇÃO] fonte de conteúdo (CMS ou API) e datas reais de publicação. */}
      </Section>

      <SpecialistCta context="Conteúdo" />
    </>
  );
}
