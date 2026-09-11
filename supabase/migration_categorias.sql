-- Execute uma vez no SQL Editor para migrar o catálogo existente.
update public.produtos
set categoria = 'Docinhos'
where categoria = 'Doces';

alter table public.produtos
drop constraint if exists produtos_categoria_check;

alter table public.produtos
add constraint produtos_categoria_check
check (categoria in ('Bolos', 'Docinhos', 'Kits', 'Copos e doces'));
