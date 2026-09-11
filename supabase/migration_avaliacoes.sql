-- Execute no SQL Editor do Supabase para habilitar avaliações e fotos.
begin;
create table if not exists public.avaliacoes (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  nome text not null,
  nota integer not null check (nota between 1 and 5),
  comentario text not null check (char_length(trim(comentario)) between 3 and 1000),
  imagem_path text,
  criado_em timestamptz not null default now()
);
alter table public.avaliacoes enable row level security;
revoke all on public.avaliacoes from anon, authenticated;
grant select (id, nome, nota, comentario, imagem_path, criado_em) on public.avaliacoes to anon, authenticated;
drop policy if exists "avaliacoes publicas" on public.avaliacoes;
create policy "avaliacoes publicas" on public.avaliacoes for select to anon, authenticated using (true);
grant delete on public.avaliacoes to authenticated;
drop policy if exists "admin gerencia avaliacoes" on public.avaliacoes;
create policy "admin gerencia avaliacoes" on public.avaliacoes for delete to authenticated using (public.eh_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avaliacoes', 'avaliacoes', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "envia foto avaliacao" on storage.objects;
create policy "envia foto avaliacao" on storage.objects for insert to authenticated
with check (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "le propria foto avaliacao" on storage.objects;
create policy "le propria foto avaliacao" on storage.objects for select to authenticated
using (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "remove upload nao publicado" on storage.objects;
create policy "remove upload nao publicado" on storage.objects for delete to authenticated
using (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (select 1 from public.avaliacoes a where a.imagem_path = name));
drop policy if exists "admin remove foto avaliacao" on storage.objects;
create policy "admin remove foto avaliacao" on storage.objects for delete to authenticated
using (bucket_id = 'avaliacoes' and public.eh_admin());

create or replace function public.publicar_avaliacao(p_nota integer, p_comentario text, p_imagem_path text default null)
returns void language plpgsql security definer set search_path = public as $$
declare nome_cliente text;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para avaliar.'; end if;
  select nome into nome_cliente from public.usuarios where id = auth.uid();
  if nome_cliente is null then raise exception 'Não foi possível encontrar seu perfil.'; end if;
  if p_nota is null or p_nota not between 1 and 5 then raise exception 'Selecione de 1 a 5 estrelas.'; end if;
  if p_comentario is null or char_length(trim(p_comentario)) not between 3 and 1000 then
    raise exception 'Escreva um comentário entre 3 e 1000 caracteres.';
  end if;
  if p_imagem_path is not null and (
    split_part(p_imagem_path, '/', 1) <> auth.uid()::text or
    not exists (select 1 from storage.objects where bucket_id = 'avaliacoes' and name = p_imagem_path)
  ) then raise exception 'A foto não pertence à sua conta.'; end if;
  insert into public.avaliacoes (usuario_id, nome, nota, comentario, imagem_path)
  values (auth.uid(), nome_cliente, p_nota, trim(p_comentario), p_imagem_path);
end;
$$;
revoke all on function public.publicar_avaliacao(integer, text, text) from public, anon;
grant execute on function public.publicar_avaliacao(integer, text, text) to authenticated;
notify pgrst, 'reload schema';
commit;
