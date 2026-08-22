import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminSession } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Mail, LogOut } from "lucide-react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

const nav = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users, exact: false },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail, exact: false },
] as const;

function LoginCard({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    onDone();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl bg-white p-8 text-navy shadow-xl"
        autoComplete="on"
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Área interna
        </p>
        <h1 className="mt-2 text-xl font-bold text-navy">Painel gerencial Atual</h1>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="admin-email" className="text-navy">E-mail corporativo</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="admin-senha" className="text-navy">Senha</Label>
            <Input
              id="admin-senha"
              type="password"
              value={senha}
              autoComplete="current-password"
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
        </div>
        {erro ? <p className="mt-4 text-sm text-destructive">{erro}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Acesso restrito ao time da Atual Câmbio. Dados pessoais de leads são protegidos por
          autenticação e não são indexados.
        </p>
      </form>
    </div>
  );
}

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setHasSession(!!session);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const session = useQuery({
    queryKey: ["admin-session", hasSession],
    queryFn: () => getAdminSession(),
    enabled: hasSession === true,
    retry: false,
  });

  if (hasSession === null) {
    return <div className="surface-navy min-h-screen" />;
  }

  if (!hasSession) {
    return <LoginCard onDone={() => setHasSession(true)} />;
  }

  if (session.isError) {
    return (
      <div className="surface-navy flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white">Sua conta não tem acesso ao painel gerencial da Atual.</p>
        <Button
          variant="secondary"
          onClick={async () => {
            await supabase.auth.signOut();
            setHasSession(false);
          }}
        >
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite lg:flex">
      <aside className="surface-navy lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">Atual</p>
            <p className="text-sm font-semibold text-white">Painel gerencial</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-4 lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "bg-white/10 text-white" }}
              inactiveProps={{ className: "text-white/65" }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/10 hover:text-white"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pb-5 pt-2 lg:pt-6">
          <p className="text-xs text-white/50">{session.data?.email}</p>
          <p className="text-[11px] text-white/40">{session.data?.roles.join(", ")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
          <ChangePasswordDialog />
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-gold"
            onClick={async () => {
              await supabase.auth.signOut();
              setHasSession(false);
              navigate({ to: "/admin" });
            }}
          >
            <LogOut className="size-3.5" aria-hidden /> Sair
          </button>
          </div>
        </div>
      </aside>

      <main className={cn("min-w-0 flex-1 px-5 py-8 lg:px-10")}>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
