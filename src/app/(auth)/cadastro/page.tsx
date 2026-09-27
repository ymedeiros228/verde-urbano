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
import { useBairrosVerde } from '@/lib/map/verde';

export default function CadastroPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: bairros = [] } = useBairrosVerde();
  const [nome, setNome] = useState('');
  const [bairro, setBairro] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('cidadao');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signUp(email, password, role, {
      nome: nome.trim(),
      bairro: bairro.trim() || undefined,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast('Conta criada!', 'folha');
    const next = new URLSearchParams(window.location.search).get('next');
    // só caminhos internos (evita redirecionamento aberto)
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
    router.push(safeNext ?? (role === 'cidadao' ? '/mapear' : '/gestao'));
  }

  return (
    <AuthShell
      title="Cadastro"
      description="Seu nome e bairro assinam os pontos que você marcar no mapa."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          required
          placeholder="Seu nome"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          placeholder="Seu bairro"
          list="bairros-teresina"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
        <datalist id="bairros-teresina">
          {bairros.map((b) => (
            <option key={b.bairro} value={b.bairro} />
          ))}
        </datalist>
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
