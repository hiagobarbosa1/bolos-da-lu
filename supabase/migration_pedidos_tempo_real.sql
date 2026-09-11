-- Execute uma única vez no SQL Editor do Supabase.
-- Permite que a área "Meus pedidos" receba alterações de status imediatamente.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pedidos'
  ) then
    alter publication supabase_realtime add table public.pedidos;
  end if;
end;
$$;
