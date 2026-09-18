import { useState } from 'react'
import { tipoDocinho, tiposDocinhos } from '../services/tiposDocinhos'

const categoriaProduto = (produto) => produto.categoria === 'Doces' ? 'Docinhos' : produto.categoria || 'Sem categoria'

export default function AdminProdutosCategorias({ produtos, aoEditar, aoExcluir, aoAlternar }) {
  const [filtro, setFiltro] = useState('Todos')
  const categorias = [...new Set(['Bolos', 'Docinhos', 'Copos e doces', 'Kits', ...produtos.map(categoriaProduto)])]

  function lista(itens) {
    return <div className="lista-admin produtos-admin">{itens.map((produto) => <article key={produto.id}>
      {produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <div className="sem-imagem">🍰</div>}
      <div className="dados-produto"><b>{produto.nome}</b><small>{tipoDocinho(produto)?.nome || categoriaProduto(produto)} · {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small><small>{produto.descricao || 'Sem descrição'}</small></div>
      <div className="acoes-produto"><label className="switch"><input type="checkbox" checked={produto.disponivel} onChange={() => aoAlternar(produto)} aria-label={`Disponibilizar ${produto.nome} para venda`} /><span /></label><small>{produto.disponivel ? 'Ativo' : 'Inativo'}</small><button type="button" onClick={() => aoEditar(produto)}>Editar</button><button type="button" onClick={() => aoExcluir(produto)}>Excluir</button></div>
    </article>)}</div>
  }

  return <div className="catalogo-admin-categorias">
    <div className="filtros-categorias-admin" role="group" aria-label="Filtrar produtos por categoria">{['Todos', ...categorias].map((categoria) => <button key={categoria} type="button" aria-pressed={filtro === categoria} onClick={() => setFiltro(categoria)}>{categoria} <span>{categoria === 'Todos' ? produtos.length : produtos.filter((produto) => categoriaProduto(produto) === categoria).length}</span></button>)}</div>
    {categorias.filter((categoria) => filtro === 'Todos' || filtro === categoria).map((categoria) => {
      const itens = produtos.filter((produto) => categoriaProduto(produto) === categoria).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      if (!itens.length && filtro === 'Todos') return null
      const grupos = [...tiposDocinhos.map((tipo) => ({ nome: tipo.nome, itens: itens.filter((produto) => tipoDocinho(produto) === tipo) })), { nome: 'Outros docinhos', itens: itens.filter((produto) => !tipoDocinho(produto)) }]
      return <section className="grupo-produtos-admin" key={categoria}>
        <h2>{categoria} <span>{itens.length} produto(s)</span></h2>
        {!itens.length ? <p className="categoria-admin-vazia">Ainda não há produtos cadastrados nesta categoria.</p> : categoria === 'Docinhos' ? grupos.filter((grupo) => grupo.itens.length).map((grupo) => <div className="subgrupo-produtos-admin" key={grupo.nome}><h3>{grupo.nome} <span>({grupo.itens.length})</span></h3>{lista(grupo.itens)}</div>) : lista(itens)}
      </section>
    })}
    {!produtos.length && filtro === 'Todos' && <p className="categoria-admin-vazia">Cadastre um produto para começar a organizar seu catálogo.</p>}
  </div>
}
