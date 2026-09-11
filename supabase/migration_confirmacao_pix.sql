-- Execute no SQL Editor após migration_forma_pagamento.sql.
-- O aviso de pagamento desaparece após a confirmação manual pela doceria.
begin;

alter table public.pedidos add column if not exists pagamento_confirmado_em timestamptz;

create or replace function public.proteger_confirmacao_pagamento()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    if new.pagamento_confirmado_em is not null and not public.eh_admin() then
      raise exception 'Somente a doceria pode confirmar o recebimento.';
    end if;
  elsif new.pagamento_confirmado_em is distinct from old.pagamento_confirmado_em and not public.eh_admin() then
    raise exception 'Somente a doceria pode confirmar o recebimento.';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_confirmacao_pagamento on public.pedidos;
create trigger proteger_confirmacao_pagamento before insert or update on public.pedidos
for each row execute function public.proteger_confirmacao_pagamento();

create or replace function public.confirmar_recebimento_pix(p_pedido_id bigint)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $$
declare
  pedido public.pedidos%rowtype;
begin
  if auth.uid() is null or not public.eh_admin() then
    raise exception 'Somente a doceria pode confirmar o recebimento.';
  end if;
  update public.pedidos
    set pagamento_confirmado_em = coalesce(pagamento_confirmado_em, now())
    where id = p_pedido_id and forma_pagamento = 'Pix' and status <> 'cancelado'
    returning * into pedido;
  if not found then
    raise exception 'Pedido Pix não encontrado ou cancelado.';
  end if;
  return pedido;
end;
$$;

revoke all on function public.confirmar_recebimento_pix(bigint) from public, anon;
grant execute on function public.confirmar_recebimento_pix(bigint) to authenticated;
notify pgrst, 'reload schema';
commit;
