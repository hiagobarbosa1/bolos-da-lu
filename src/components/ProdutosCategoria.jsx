import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { quantidadesDocinhos, tipoDocinho, tiposDocinhos } from '../services/tiposDocinhos'

const moeda = (valor) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function SeletorQuantidade({ produto, quantidade, aoQuantidade, erro }) {
  return <label className="quantidade-docinhos">Quantidade
    <select value={quantidade || ''} aria-invalid={Boolean(erro)} onChange={(event) => aoQuantidade(Number(event.target.value))}>
      <option value="" disabled>Selecione a quantidade</option>
      {quantidadesDocinhos.map((valor) => <option key={valor} value={valor}>{valor} unidades — {moeda(Number(produto.preco) * valor / 100)}</option>)}
    </select>
    {erro && <span className="erro-quantidade-docinhos" role="alert">Selecione a quantidade antes de adicionar ao carrinho.</span>}
  </label>
}

function InformacoesProduto({ produto, origem, quantidade, aoQuantidade, erro, aoFechar, aoAdicionar }) {
  const dialogo = useRef(null)
  const tipo = tipoDocinho(produto)

  useEffect(() => {
    const painel = dialogo.current
    function posicionar() {
      const area = origem.getBoundingClientRect()
      const largura = Math.min(360, window.innerWidth - 24)
      const esquerda = area.right + 16 + largura <= window.innerWidth - 12
        ? area.right + 16
        : Math.max(12, area.left - largura - 16)
      painel.style.left = `${Math.min(esquerda, window.innerWidth - largura - 12)}px`
      painel.style.top = `${Math.max(12, Math.min(area.top, window.innerHeight - painel.offsetHeight - 12))}px`
    }
    painel.showModal()
    posicionar()
    window.addEventListener('resize', posicionar)
    return () => {
      window.removeEventListener('resize', posicionar)
      painel.close()
      if (origem.isConnected) origem.querySelector('button')?.focus({ preventScroll: true })
    }
  }, [origem])

  return createPortal(<dialog ref={dialogo} className="informacoes-produto" aria-labelledby="titulo-informacoes-produto" onCancel={aoFechar} onClick={(event) => { if (event.target === event.currentTarget) aoFechar() }}>
    <div className="conteudo-informacoes-produto">
      <button className="fechar-informacoes-produto" type="button" aria-label="Fechar informações do produto" onClick={aoFechar} autoFocus>×</button>
      {produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <div className="imagem-informacoes-ausente" aria-hidden="true">🧁</div>}
      <p className="linha-informacoes-produto">{tipo?.nome || produto.categoria}</p>
      <h3 id="titulo-informacoes-produto">{produto.nome}</h3>
      {produto.descricao && <p className="descricao-informacoes-produto">{produto.descricao}</p>}
      <strong className="preco-informacoes-produto">{moeda(produto.preco)}{tipo && ' / cento'}</strong>
      {tipo && <SeletorQuantidade produto={produto} quantidade={quantidade} aoQuantidade={aoQuantidade} erro={erro} />}
      {(!tipo || quantidade) && <div className="total-informacoes-produto"><span>Total</span><strong>{moeda(tipo ? Number(produto.preco) * quantidade / 100 : produto.preco)}</strong></div>}
      <button type="button" className="adicionar-informacoes-produto" onClick={(event) => { if (aoAdicionar(produto, event)) aoFechar() }}>Adicionar ao carrinho +</button>
    </div>
  </dialog>, document.body)
}

export default function ProdutosCategoria({ categoria, produtos, aoAdicionar, produtoQuantidadePendente }) {
  const [quantidades, setQuantidades] = useState({})
  const [erros, setErros] = useState(() => produtoQuantidadePendente ? { [produtoQuantidadePendente]: true } : {})
  const [selecionado, setSelecionado] = useState(null)
  const doces = ['Docinhos', 'Doces'].includes(categoria)
  const itens = produtos.filter((produto) => doces ? ['Docinhos', 'Doces'].includes(produto.categoria) : produto.categoria === categoria)

  function escolherQuantidade(produto, quantidade) {
    setQuantidades((atual) => ({ ...atual, [produto.id]: quantidade }))
    setErros((atual) => ({ ...atual, [produto.id]: false }))
  }

  function adicionar(produto, event) {
    const tipo = tipoDocinho(produto)
    const quantidade = quantidades[produto.id]
    if (tipo && !quantidadesDocinhos.includes(quantidade)) {
      setErros((atual) => ({ ...atual, [produto.id]: true }))
      event.currentTarget.parentElement.querySelector('select')?.focus()
      return false
    }
    aoAdicionar(tipo ? { ...produto, quantidade } : produto, 'produto')
    return true
  }

  function cards(lista) {
    return <div className="produtos-modal-categoria">{lista.map((produto) => <article key={produto.id}>
      <div className="foto-produto-categoria">{produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <span>🧁</span>}</div>
      <h3>{produto.nome}</h3>
      <strong>{moeda(produto.preco)}{tipoDocinho(produto) && ' / cento'}</strong>
      <button className="link-informacoes-produto" type="button" aria-haspopup="dialog" aria-label={`Ver informações do produto: ${produto.nome}`} onClick={(event) => setSelecionado({ produto, origem: event.currentTarget.closest('article') })}>Ver informações do produto</button>
      {tipoDocinho(produto) && <SeletorQuantidade produto={produto} quantidade={quantidades[produto.id]} aoQuantidade={(quantidade) => escolherQuantidade(produto, quantidade)} erro={erros[produto.id]} />}
      <button type="button" onClick={(event) => adicionar(produto, event)}>Adicionar ao carrinho +</button>
    </article>)}</div>
  }

  const painel = selecionado && <InformacoesProduto produto={selecionado.produto} origem={selecionado.origem} quantidade={quantidades[selecionado.produto.id]} aoQuantidade={(quantidade) => escolherQuantidade(selecionado.produto, quantidade)} erro={erros[selecionado.produto.id]} aoFechar={() => setSelecionado(null)} aoAdicionar={adicionar} />

  if (!doces) return <>{cards(itens)}{!itens.length && <p className="modal-vazio">Ainda não há produtos cadastrados nesta categoria.</p>}{painel}</>

  const outros = itens.filter((produto) => !tipoDocinho(produto))
  return <>
    <p className="aviso-cento">Escolha 25, 50, 75 ou 100 unidades de cada doce. O valor é calculado conforme a quantidade.</p>
    {tiposDocinhos.map((tipo) => {
      const lista = itens.filter((produto) => tipoDocinho(produto) === tipo)
      return <section className="grupo-docinhos" key={tipo.nome}>
        <div className="cabecalho-docinhos"><h3>{tipo.nome}</h3><strong>{moeda(tipo.preco)} <span>o cento</span></strong></div>
        {lista.length ? cards(lista) : <p className="modal-vazio">Os sabores desta linha estarão disponíveis em breve.</p>}
      </section>
    })}
    {outros.length > 0 && <section className="grupo-docinhos"><div className="cabecalho-docinhos"><h3>Outros doces</h3></div>{cards(outros)}</section>}
    {painel}
  </>
}
