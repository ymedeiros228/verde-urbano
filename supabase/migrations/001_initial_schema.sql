-- Verde Urbano — schema inicial (Supabase Free + PostGIS opcional)
-- Rodar no SQL Editor do projeto Supabase

create extension if not exists "pgcrypto";

create type public.user_role as enum ('cidadao', 'ong', 'prefeitura');
create type public.tipo_ponto as enum (
  'terreno_baldio', 'praca', 'canteiro', 'lazer_infantil', 'outro'
);
create type public.status_ponto as enum (
  'aberto', 'em_analise', 'aprovado', 'em_mutirao', 'concluido'
);

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role public.user_role not null default 'cidadao',
  bairro text,
  created_at timestamptz not null default now()
);

create table if not exists public.pontos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  titulo text not null,
  descricao text,
  local text,
  bairro text not null,
  tipo public.tipo_ponto not null default 'outro',
  status public.status_ponto not null default 'aberto',
  step text default 'mapeado',
  votos int not null default 0,
  urgencia int not null default 50,
  lng double precision not null,
  lat double precision not null,
  foto_url text,
  badge text,
  badge_tone text,
  necessidades text[] default '{}',
  ong_recomendado boolean default false,
  mutirao_data text
);

create table if not exists public.votos (
  id uuid primary key default gen_random_uuid(),
  ponto_id uuid not null references public.pontos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (ponto_id, user_id)
);

create table if not exists public.mutiroes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  local text not null,
  bairro text not null,
  data date not null,
  horario text not null,
  voluntarios int default 0,
  capacidade int default 40,
  ong text not null,
  tipo text not null,
  demanda_id uuid references public.pontos(id) on delete set null,
  foto_url text
);

create table if not exists public.especies (
  id text primary key,
  nome text not null,
  cientifico text not null,
  porte text not null,
  raiz text not null,
  sombra text not null,
  observacao text
);

alter table public.perfis enable row level security;
alter table public.pontos enable row level security;
alter table public.votos enable row level security;
alter table public.mutiroes enable row level security;
alter table public.especies enable row level security;

create policy "pontos_select_all" on public.pontos for select using (true);
create policy "pontos_insert_auth" on public.pontos for insert
  with check (auth.uid() = user_id);
create policy "pontos_update_own_or_staff" on public.pontos for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.perfis p
      where p.id = auth.uid() and p.role in ('ong', 'prefeitura')
    )
  );

create policy "votos_select" on public.votos for select using (true);
create policy "votos_insert" on public.votos for insert
  with check (auth.uid() = user_id);

create policy "mutiroes_select" on public.mutiroes for select using (true);
create policy "especies_select" on public.especies for select using (true);
create policy "perfis_select_own" on public.perfis for select
  using (auth.uid() = id);
create policy "perfis_update_own" on public.perfis for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis (id, role, nome)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'cidadao'),
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
