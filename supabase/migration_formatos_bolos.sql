-- Execute no SQL Editor do Supabase antes de cadastrar as duas fotos dos bolos.
-- A imagem antiga permanece disponivel; nenhuma foto existente e removida.
alter table public.produtos add column if not exists imagem_redondo text;
alter table public.produtos add column if not exists imagem_retangular text;
