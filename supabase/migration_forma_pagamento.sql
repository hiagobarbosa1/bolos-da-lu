-- Execute no SQL Editor do Supabase antes de publicar o carrinho atualizado.
-- Mantém a função anterior para compatibilidade com clientes antigos.
begin;

alter table public.pedidos add column if not exists forma_pagamento text
  check (forma_pagamento in ('Pix', 'Cartão de débito', 'Cartão de crédito', 'Dinheiro'));

create or replace function public.finalizar_pedido_pronta_entrega(
  p_data_entrega date,
  p_endereco text,
  p_itens jsonb,
  p_forma_pagamento text
)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  doce public.doces_pronta_entrega%rowtype;
  pedido public.pedidos%rowtype;
  quantidade integer;
  total numeric(10,2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta para finalizar o pedido.';
  end if;

  if p_forma_pagamento is null or p_forma_pagamento not in ('Pix', 'Cartão de débito', 'Cartão de crédito', 'Dinheiro') then
    raise exception 'Selecione a forma de pagamento.';
  end if;

  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'O carrinho está vazio.';
  end if;

  insert into public.pedidos (usuario_id, data_entrega, endereco, valor_total, forma_pagamento)
  values (auth.uid(), p_data_entrega, p_endereco, 0, p_forma_pagamento)
  returning * into pedido;

  for item in select * from jsonb_array_elements(p_itens)
  loop
    quantidade := (item ->> 'quantidade')::integer;
    if quantidade is null or quantidade < 1 then
      raise exception 'Quantidade inválida.';
    end if;

    select * into doce
    from public.doces_pronta_entrega
    where id = (item ->> 'id')::bigint
    for update;

    if not found or not doce.disponivel then
      raise exception 'Este produto não está mais disponível.';
    end if;

    if doce.quantidade_disponivel < quantidade then
      raise exception 'Estoque insuficiente para "%". Restam % unidade(s).', doce.nome, doce.quantidade_disponivel;
    end if;

    update public.doces_pronta_entrega
    set quantidade_disponivel = quantidade_disponivel - quantidade
    where id = doce.id;

    insert into public.itens_pedido (pedido_id, nome_produto, tipo_item, quantidade, observacao)
    values (pedido.id, doce.nome, 'pronta_entrega', quantidade, null);

    total := total + (doce.preco * quantidade);
  end loop;

  update public.pedidos set valor_total = total where id = pedido.id returning * into pedido;
  return pedido;
end;
$$;

grant execute on function public.finalizar_pedido_pronta_entrega(date, text, jsonb, text) to authenticated;

-- Atualiza imediatamente o cache de funções usado pela API do Supabase.
notify pgrst, 'reload schema';

commit;
