-- Execute este arquivo uma vez no SQL Editor do Supabase.
-- Cria o local público para as imagens cadastradas pela administradora.
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

create policy "admin envia imagens de produtos"
on storage.objects for insert to authenticated
with check (bucket_id = 'produtos' and public.eh_admin());

create policy "admin atualiza imagens de produtos"
on storage.objects for update to authenticated
using (bucket_id = 'produtos' and public.eh_admin())
with check (bucket_id = 'produtos' and public.eh_admin());

create policy "admin exclui imagens de produtos"
on storage.objects for delete to authenticated
using (bucket_id = 'produtos' and public.eh_admin());
