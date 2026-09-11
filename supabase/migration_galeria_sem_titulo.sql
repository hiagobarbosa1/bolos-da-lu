-- Execute no SQL Editor para atualizar a galeria já existente.
-- Remove apenas os títulos; mantém as fotos, a ordem e a visibilidade.
begin;
alter table public.galeria_bolos drop column if exists titulo;
notify pgrst, 'reload schema';
commit;
