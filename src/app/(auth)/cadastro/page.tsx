'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useAuth, type Role } from '@/components/providers/AuthProvider';

export default function CadastroPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('cidadao');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signUp(email, password, role);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast('Conta criada!', 'folha');
    router.push(role === 'cidadao' ? '/feed' : '/gestao');
  }

  return (
    <AuthShell
      title="Cadastro"
      description="Escolha o papel para o piloto (cidadão, ONG ou Prefeitura)."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          required
          minLength={6}
          placeholder="Senha (mín. 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          aria-label="Papel"
        >
          <option value="cidadao">Cidadão</option>
          <option value="ong">ONG</option>
          <option value="prefeitura">Prefeitura</option>
        </Select>
        {error && <p className="text-sm text-laterita">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Criando…' : 'Criar conta'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-folha underline">
          Já tenho conta
        </Link>
      </p>
    </AuthShell>
  );
}
