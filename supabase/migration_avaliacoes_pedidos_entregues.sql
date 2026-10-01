-- Execute depois de migration_avaliacoes.sql no SQL Editor do Supabase.
begin;

-- Avaliações antigas permanecem publicadas, sem atribuir compras fictícias.
alter table public.avaliacoes add column if not exists item_pedido_id bigint references public.itens_pedido(id);
create unique index if not exists avaliacao_por_item_idx on public.avaliacoes(item_pedido_id);

-- Clientes não podem fabricar pedidos entregues ou adicionar itens após a entrega.
drop policy if exists "usuário cria seu pedido" on public.pedidos;
create policy "usuário cria seu pedido" on public.pedidos for insert to authenticated
with check (usuario_id = auth.uid() and status = 'novo');
drop policy if exists "usuário cria itens próprios" on public.itens_pedido;
create policy "usuário cria itens próprios" on public.itens_pedido for insert to authenticated
with check (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid() and p.status = 'novo'));

create or replace function public.listar_produtos_para_avaliar()
returns table(item_pedido_id bigint, pedido_id bigint, nome_produto text)
language sql stable security definer set search_path = public as $$
  select i.id, p.id, coalesce(nullif(i.nome_produto, ''), pr.nome, 'Produto personalizado')
  from public.itens_pedido i
  join public.pedidos p on p.id = i.pedido_id
  left join public.produtos pr on pr.id = i.produto_id
  where p.usuario_id = auth.uid() and p.status = 'entregue'
    and not exists (select 1 from public.avaliacoes a where a.item_pedido_id = i.id)
  order by p.criado_em desc, i.id;
$$;
revoke all on function public.listar_produtos_para_avaliar() from public, anon;
grant execute on function public.listar_produtos_para_avaliar() to authenticated;

-- A validação no banco também bloqueia chamadas diretas e versões antigas do site.
create or replace function public.validar_compra_avaliacao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or new.usuario_id is distinct from auth.uid() then
    raise exception 'Entre na sua conta para avaliar.';
  end if;
  perform 1 from public.itens_pedido i join public.pedidos p on p.id = i.pedido_id
    where i.id = new.item_pedido_id and p.usuario_id = auth.uid() and p.status = 'entregue'
    for share of p, i;
  if not found then
    raise exception 'Você só pode avaliar produtos de pedidos que já recebeu.';
  end if;
  return new;
end;
$$;
revoke all on function public.validar_compra_avaliacao() from public, anon, authenticated;
drop trigger if exists validar_compra_avaliacao on public.avaliacoes;
create trigger validar_compra_avaliacao before insert or update on public.avaliacoes
for each row execute function public.validar_compra_avaliacao();

drop function if exists public.publicar_avaliacao(integer, text, text);
create or replace function public.publicar_avaliacao(p_item_pedido_id bigint, p_nota integer, p_comentario text, p_imagem_path text default null)
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
  insert into public.avaliacoes (usuario_id, item_pedido_id, nome, nota, comentario, imagem_path)
    values (auth.uid(), p_item_pedido_id, nome_cliente, p_nota, trim(p_comentario), p_imagem_path);
exception when unique_violation then
  raise exception 'Você já avaliou esse produto deste pedido.';
end;
$$;
revoke all on function public.publicar_avaliacao(bigint, integer, text, text) from public, anon;
grant execute on function public.publicar_avaliacao(bigint, integer, text, text) to authenticated;

drop policy if exists "envia foto avaliacao" on storage.objects;
create policy "envia foto avaliacao" on storage.objects for insert to authenticated
with check (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.listar_produtos_para_avaliar()));

notify pgrst, 'reload schema';
commit;
