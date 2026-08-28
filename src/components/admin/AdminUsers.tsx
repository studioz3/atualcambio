import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStaffUser,
  listStaffUsers,
  resetStaffPassword,
  setStaffRole,
  type StaffUser,
} from "@/lib/users.functions";
import { roleLabels, type AppRole } from "@/lib/roles-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleOptions: AppRole[] = ["admin", "marketing", "consultor"];

export function AdminUsers() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listStaffUsers(), retry: false });

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<AppRole>("consultor");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const create = useMutation({
    mutationFn: () => createStaffUser({ data: { email, senha, role } }),
    onSuccess: () => {
      toast.success("Acesso criado.");
      setEmail("");
      setSenha("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: (v: { userId: string; role: AppRole | null }) => setStaffRole({ data: v }),
    onSuccess: () => {
      toast.success("Nível atualizado.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetPassword = useMutation({
    mutationFn: (v: { userId: string; senha: string }) => resetStaffPassword({ data: v }),
    onSuccess: () => toast.success("Senha redefinida."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-navy">Criar novo acesso</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Administrador: acesso total. Marketing: métricas, conteúdo e redes sociais. Comercial:
          apenas leads.
        </p>
        <form
          className="mt-4 grid gap-4 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2">
            <Label htmlFor="novo-email" className="text-navy">E-mail corporativo</Label>
            <Input
              id="novo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nova-senha" className="text-navy">Senha provisória</Label>
            <Input
              id="nova-senha"
              type="text"
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-navy">Nível</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Criando…" : "Criar acesso"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-navy">Usuários do painel</h2>
        {users.isError ? (
          <p className="mt-4 text-sm text-destructive">{(users.error as Error).message}</p>
        ) : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="py-2">E-mail</th>
                <th className="py-2">Nível</th>
                <th className="py-2">Último acesso</th>
                <th className="py-2">Senha</th>
              </tr>
            </thead>
            <tbody>
              {(users.data?.users ?? []).map((u: StaffUser) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="py-3 text-navy">{u.email}</td>
                  <td className="py-3">
                    <Select
                      value={u.role ?? "none"}
                      onValueChange={(v) =>
                        changeRole.mutate({ userId: u.id, role: v === "none" ? null : (v as AppRole) })
                      }
                    >
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem acesso</SelectItem>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString("pt-BR")
                      : "Nunca acessou"}
                  </td>
                  <td className="py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const senha = window.prompt("Nova senha (mínimo 8 caracteres)");
                        if (senha && senha.length >= 8) resetPassword.mutate({ userId: u.id, senha });
                      }}
                    >
                      Redefinir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
