-- Pontos assinados pelo perfil + fotos reais no Storage

alter table public.pontos add column if not exists autor_nome text;

alter table public.perfis add column if not exists bairro text;

-- nome/bairro do cadastro também no perfil
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis (id, role, nome, bairro)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'cidadao'),
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'bairro'
  );
  return new;
end;
$$;

-- bucket público de leitura; cada usuário só escreve na própria pasta (<uid>/arquivo.jpg)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "fotos_leitura_publica" on storage.objects for select
  using (bucket_id = 'fotos');

create policy "fotos_upload_propria_pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
