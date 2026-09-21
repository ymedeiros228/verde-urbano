'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const { signIn, demoLogin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast('Bem-vindo de volta!', 'folha');
    router.push('/feed');
  }

  return (
    <AuthShell
      title="Entrar"
      description="Conta Supabase ou login demo para a banca."
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
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-laterita">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <div className="mt-6 space-y-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            demoLogin('ong');
            toast('Demo ONG ativa', 'ipe');
            router.push('/gestao');
          }}
        >
          Demo ONG → Painel
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            demoLogin('cidadao');
            toast('Demo cidadão ativa', 'folha');
            router.push('/feed');
          }}
        >
          Demo cidadão → Feed
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-tinta-faint">
        <Link href="/cadastro" className="text-folha underline">
          Criar conta
        </Link>
        {' · '}
        <Link href="/" className="underline">
          Início
        </Link>
      </p>
    </AuthShell>
  );
}
