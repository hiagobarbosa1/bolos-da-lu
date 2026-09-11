-- Execute este arquivo no SQL Editor do projeto Supabase.
-- As senhas ficam exclusivamente no Supabase Auth, nunca nesta tabela.
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  papel text not null default 'cliente' check (papel in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

create table if not exists public.produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  categoria text not null check (categoria in ('Bolos', 'Docinhos', 'Kits', 'Copos e doces')),
  preco numeric(10,2) not null check (preco >= 0),
  descricao text,
  imagem text,
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Doces disponíveis para retirada/entrega imediata. O admin pode ativá-los ou ocultá-los a qualquer momento.
create table if not exists public.doces_pronta_entrega (
  id bigint generated always as identity primary key,
  nome text not null,
  preco numeric(10,2) not null check (preco >= 0),
  descricao text,
  imagem text,
  quantidade_disponivel integer not null default 0 check (quantidade_disponivel >= 0),
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.pedidos (
  id bigint generated always as identity primary key,
  usuario_id uuid references public.usuarios(id) on delete set null,
  data_entrega date not null,
  valor_total numeric(10,2) not null default 0 check (valor_total >= 0),
  status text not null default 'novo' check (status in ('novo', 'producao', 'pronto', 'entregue', 'cancelado')),
  endereco text,
  forma_pagamento text check (forma_pagamento in ('Pix', 'Cartão de débito', 'Cartão de crédito', 'Dinheiro')),
  pagamento_confirmado_em timestamptz,
  distancia numeric(7,2),
  observacao text,
  criado_em timestamptz not null default now()
);

create table if not exists public.itens_pedido (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references public.pedidos(id) on delete cascade,
  produto_id bigint references public.produtos(id) on delete set null,
  quantidade integer not null check (quantidade > 0),
  tamanho text,
  sabor text,
  recheio text,
  cobertura text,
  decoracao text,
  observacao text
);

alter table public.itens_pedido add column if not exists nome_produto text;
alter table public.itens_pedido add column if not exists tipo_item text;

create table if not exists public.referencias (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references public.pedidos(id) on delete cascade,
  imagem text not null,
  data_envio timestamptz not null default now()
);

create index if not exists pedidos_status_idx on public.pedidos(status);
create index if not exists pedidos_data_entrega_idx on public.pedidos(data_entrega);
create index if not exists itens_pedido_pedido_idx on public.itens_pedido(pedido_id);
-- Garante que somente uma conta pode ser promovida a administradora.
create unique index if not exists unico_administrador on public.usuarios(papel) where papel = 'admin';

-- Bucket privado para as fotos de referência.
insert into storage.buckets (id, name, public) values ('referencias', 'referencias', false)
on conflict (id) do nothing;

alter table public.usuarios enable row level security;
alter table public.produtos enable row level security;
alter table public.doces_pronta_entrega enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.referencias enable row level security;

create or replace function public.eh_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.usuarios where id = auth.uid() and papel = 'admin');
$$;

-- Cria o perfil público automaticamente no instante em que o Auth cria uma conta.
-- Isso funciona mesmo antes da confirmação do e-mail.
create or replace function public.criar_perfil_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email, telefone, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'telefone',
    'cliente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
after insert on auth.users
for each row execute procedure public.criar_perfil_usuario();

-- Perfis: o cliente cria e consulta somente o próprio perfil; o admin consulta todos.
create policy "usuário lê próprio perfil" on public.usuarios for select using (id = auth.uid() or public.eh_admin());
create policy "usuário cria próprio perfil" on public.usuarios for insert with check (id = auth.uid() and papel = 'cliente');
create policy "admin gerencia perfis" on public.usuarios for all using (public.eh_admin()) with check (public.eh_admin());

create policy "produtos públicos disponíveis" on public.produtos for select using (disponivel = true or public.eh_admin());
create policy "admin gerencia produtos" on public.produtos for all using (public.eh_admin()) with check (public.eh_admin());
create policy "doces pronta entrega públicos" on public.doces_pronta_entrega for select using ((disponivel = true and quantidade_disponivel > 0) or public.eh_admin());
create policy "admin gerencia doces pronta entrega" on public.doces_pronta_entrega for all using (public.eh_admin()) with check (public.eh_admin());
create policy "usuário vê seus pedidos" on public.pedidos for select using (usuario_id = auth.uid() or public.eh_admin());
create policy "usuário cria seu pedido" on public.pedidos for insert with check (usuario_id = auth.uid());
create policy "admin atualiza pedidos" on public.pedidos for update using (public.eh_admin());
create policy "usuário vê itens próprios" on public.itens_pedido for select using (exists(select 1 from public.pedidos p where p.id = pedido_id and (p.usuario_id = auth.uid() or public.eh_admin())));
create policy "usuário cria itens próprios" on public.itens_pedido for insert with check (exists(select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));
create policy "usuário vê referências próprias" on public.referencias for select using (exists(select 1 from public.pedidos p where p.id = pedido_id and (p.usuario_id = auth.uid() or public.eh_admin())));
create policy "usuário cria referências próprias" on public.referencias for insert with check (exists(select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));

create policy "usuário envia referência" on storage.objects for insert to authenticated with check (bucket_id = 'referencias' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "usuário lê referência própria" on storage.objects for select to authenticated using (bucket_id = 'referencias' and (storage.foldername(name))[1] = auth.uid()::text);
