-- Execute no SQL Editor do Supabase antes de salvar os tamanhos dos bolos.
alter table public.produtos add column if not exists preco_p numeric(10,2) check (preco_p >= 0);
alter table public.produtos add column if not exists preco_m numeric(10,2) check (preco_m >= 0);
alter table public.produtos add column if not exists preco_g numeric(10,2) check (preco_g >= 0);
alter table public.produtos add column if not exists fatias_p text;
alter table public.produtos add column if not exists fatias_m text;
alter table public.produtos add column if not exists fatias_g text;

-- Preserva o preco antigo como P; M e G precisam ser preenchidos no cadastro.
update public.produtos set preco_p = preco where categoria = 'Bolos' and preco_p is null;
