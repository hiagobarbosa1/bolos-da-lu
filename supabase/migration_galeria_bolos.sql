-- Execute no SQL Editor do Supabase. Usa a função eh_admin() do schema.sql.
begin;
create table if not exists public.galeria_bolos (
  id bigint generated always as identity primary key,
  imagem_path text not null unique,
  ordem integer not null default 0 check (ordem >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
-- Atualiza também tabelas criadas pela versão anterior.
alter table public.galeria_bolos drop column if exists titulo;
alter table public.galeria_bolos enable row level security;
grant select on public.galeria_bolos to anon, authenticated;
grant insert, update, delete on public.galeria_bolos to authenticated;
grant usage, select on sequence public.galeria_bolos_id_seq to authenticated;
drop policy if exists "galeria visivel" on public.galeria_bolos;
create policy "galeria visivel" on public.galeria_bolos for select to anon, authenticated using (ativo or public.eh_admin());
drop policy if exists "admin gerencia galeria" on public.galeria_bolos;
create policy "admin gerencia galeria" on public.galeria_bolos for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria-bolos', 'galeria-bolos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "admin envia galeria" on storage.objects;
create policy "admin envia galeria" on storage.objects for insert to authenticated with check (bucket_id = 'galeria-bolos' and public.eh_admin());
drop policy if exists "admin le arquivos galeria" on storage.objects;
create policy "admin le arquivos galeria" on storage.objects for select to authenticated using (bucket_id = 'galeria-bolos' and public.eh_admin());
drop policy if exists "admin exclui arquivos galeria" on storage.objects;
create policy "admin exclui arquivos galeria" on storage.objects for delete to authenticated using (bucket_id = 'galeria-bolos' and public.eh_admin());
notify pgrst, 'reload schema';
commit;
