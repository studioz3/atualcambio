import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Rota preservada apenas como redirect permanente para /quem-somos.
 * A página institucional única passou a ser /quem-somos.
 */
export const Route = createFileRoute("/a-atual")({
  beforeLoad: () => {
    throw redirect({ to: "/quem-somos", replace: true });
  },
});
