import { useEffect, useRef, useState } from 'react'
import { acompanharPedidosEmTempoReal, listarMeusPedidos } from '../services/pedidosService'
import { dataPedido, moedaPedido, nomeItemPedido, resumoMeusPedidos } from '../services/resumoMeusPedidos'
import { linkWhatsApp } from '../services/whatsappService'
import './MeusPedidos.css'

const etapas = ['novo', 'producao', 'pronto', 'entregue']

function Icone({ tipo }) {
  const caminhos = {
    calendario: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/></>,
    local: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    sacola: <><rect x="4" y="7" width="16" height="15" rx="3"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>,
    pagamento: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></>,
    whatsapp: <><path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.4-4.8A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 1c-1 4-5 2-8-1S5 8 8 7Z"/></>,
  }
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{caminhos[tipo]}</svg>
}

function FotoPedido({ item }) {
  const [falhou, setFalhou] = useState(false)
  const produto = item?.produtos
  const imagem = /retangular/i.test(item?.nome_produto || '') ? produto?.imagem_retangular : produto?.imagem_redondo || produto?.imagem
  return <div className="pedido-foto">{imagem && !falhou ? <img src={imagem} alt="" loading="lazy" onError={() => setFalhou(true)} /> : <Icone tipo="sacola" />}</div>
}

function Informacao({ tipo, titulo, children }) {
  return <div className="pedido-informacao"><span className="pedido-icone"><Icone tipo={tipo} /></span><div><span>{titulo}</span><strong>{children}</strong></div></div>
}

function CardPedido({ pedido }) {
  const [aberto, setAberto] = useState(false)
  const resumo = resumoMeusPedidos(pedido)
  const itens = pedido.itens_pedido || []
  const etapaAtual = etapas.indexOf(pedido.status)
  const titulos = ['Pedido recebido', 'Em produção', resumo.retirada ? 'Pronto para retirada' : 'Pronto para entrega', 'Pedido finalizado']
  const whatsapp = linkWhatsApp(`Olá, Bolos da Lu! Gostaria de falar sobre meu pedido #${pedido.id}.\nStatus: ${resumo.titulo}\nTotal: ${moedaPedido(pedido.valor_total)}`)
  const mostrarResumo = !resumo.encerrado || aberto
  return <article className={`pedido-card${resumo.encerrado ? ' pedido-card-encerrado' : ''}${pedido.status === 'cancelado' ? ' pedido-card-cancelado' : ''}`}>
    <header className="pedido-card-topo"><span>PEDIDO #{pedido.id}</span><strong>{moedaPedido(pedido.valor_total)}</strong></header>
    <h3>{resumo.titulo}</h3>
    <p className="pedido-status-descricao">{resumo.descricao}</p>
    {!resumo.encerrado && <ol className="pedido-etapas" aria-label="Etapas do pedido">{etapas.map((status, indice) => <li key={status} className={indice <= etapaAtual ? 'etapa-atingida' : ''} aria-current={indice === etapaAtual ? 'step' : undefined}><span className="pedido-etapa-numero" aria-hidden="true">{indice < etapaAtual ? '✓' : indice + 1}</span><span>{titulos[indice]}</span></li>)}</ol>}
    <div className="pedido-resumo-itens"><FotoPedido item={itens[0]} /><div><h4>Itens do pedido</h4><ul>{itens.length ? itens.map((item) => <li key={item.id}>{item.quantidade}× {nomeItemPedido(item)}</li>) : <li>Encomenda personalizada</li>}</ul></div></div>
    {mostrarResumo && <div className="pedido-informacoes">
      <Informacao tipo="calendario" titulo="Pedido feito em">{dataPedido(pedido.criado_em)}</Informacao>
      <Informacao tipo="local" titulo={resumo.encerrado ? 'Agendamento combinado' : resumo.rotuloAgendamento}>{resumo.agendamento}</Informacao>
      {!resumo.encerrado && resumo.estimado && <p className="pedido-nota">Previsão aproximada, sujeita à confirmação da loja.</p>}
    </div>}
    {mostrarResumo && whatsapp && <a className="pedido-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><Icone tipo="whatsapp"/><span>{resumo.encerrado ? 'Falar com a loja sobre o pedido' : 'Acompanhar pedido no WhatsApp'}</span><span aria-hidden="true">→</span></a>}
    <button className="pedido-expandir" type="button" aria-expanded={aberto} aria-controls={`pedido-detalhes-${pedido.id}`} onClick={() => setAberto((valor) => !valor)}>{aberto ? 'Ver menos informações' : 'Ver mais informações'}<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={aberto ? 'm5 15 7-7 7 7' : 'm5 9 7 7 7-7'}/></svg></button>
    <div className="pedido-detalhes" id={`pedido-detalhes-${pedido.id}`} hidden={!aberto}>
      <Informacao tipo="pagamento" titulo="Pagamento">{resumo.pagamento}</Informacao>
      {pedido.forma_pagamento === 'Pix' && pedido.pagamento_confirmado_em && <p className="pedido-nota">Confirmado em {dataPedido(pedido.pagamento_confirmado_em)}.</p>}
      <Informacao tipo="local" titulo={resumo.modalidade}>{resumo.endereco || (resumo.retirada ? 'Retirada na Bolos da Lu, no horário combinado.' : 'Combine o endereço com a loja.')}</Informacao>
      <div className="pedido-especificacoes"><h4>Detalhes dos produtos</h4>{itens.map((item) => <div key={item.id}><strong>{item.quantidade}× {nomeItemPedido(item)}</strong><dl>{[['Tamanho', item.tamanho], ['Sabor', item.sabor], ['Recheio', item.recheio], ['Cobertura', item.cobertura], ['Decoração', item.decoracao], ['Observação', item.observacao]].filter(([, valor]) => valor).map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>)}</dl></div>)}</div>
      {pedido.observacao && <div className="pedido-observacao"><h4>Observações do pedido</h4><p>{pedido.observacao}</p></div>}
      {pedido.status === 'entregue' && <p className="pedido-nota">Você já pode avaliar os produtos recebidos na seção de avaliações do site.</p>}
      <div className="pedido-total"><span>Total do pedido</span><strong>{moedaPedido(pedido.valor_total)}</strong></div>
    </div>
  </article>
}

export default function MeusPedidos({ usuario, aoFechar }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const dialogo = useRef(null)
  useEffect(() => {
    const painel = dialogo.current
    const focoAnterior = document.activeElement
    const overflowAnterior = document.body.style.overflow
    painel.showModal()
    document.body.style.overflow = 'hidden'
    return () => { painel.close(); document.body.style.overflow = overflowAnterior; if (focoAnterior?.isConnected) focoAnterior.focus() }
  }, [])
  useEffect(() => {
    let ativo = true
    let consultando = false
    const carregar = async () => {
      if (consultando) return
      consultando = true
      try { const resultado = await listarMeusPedidos(); if (ativo) { setPedidos(resultado); setErro('') } }
      catch (e) { if (ativo) setErro(e.message) }
      finally { consultando = false; if (ativo) setCarregando(false) }
    }
    carregar()
    const pararTempoReal = acompanharPedidosEmTempoReal(usuario.id, carregar)
    const intervalo = window.setInterval(carregar, 15000)
    return () => { ativo = false; pararTempoReal(); window.clearInterval(intervalo) }
  }, [usuario.id, tentativa])
  return <dialog ref={dialogo} className="modal-pedidos" aria-labelledby="titulo-meus-pedidos" onCancel={aoFechar} onMouseDown={(event) => { if (event.target === event.currentTarget) aoFechar() }}>
    <section className="painel-pedidos">
      <button className="fechar-pedidos" type="button" onClick={aoFechar} aria-label="Fechar meus pedidos" autoFocus>×</button>
      <p className="sobretitulo">ACOMPANHE POR AQUI</p><h2 id="titulo-meus-pedidos">Meus pedidos</h2>
      <p className="descricao-pedidos">As atualizações dos seus pedidos aparecem aqui automaticamente.</p>
      {carregando && <p className="pedidos-vazio" role="status">Carregando pedidos…</p>}
      {erro && <div className="erro-pedidos" role="alert"><p>Não foi possível atualizar seus pedidos. {pedidos.length > 0 && 'As informações abaixo são da última atualização.'}</p><button type="button" onClick={() => { setCarregando(true); setErro(''); setTentativa((valor) => valor + 1) }}>Tentar novamente</button></div>}
      {!carregando && !erro && pedidos.length === 0 && <div className="pedidos-vazio"><Icone tipo="sacola"/><h3>Seu primeiro pedido começa aqui</h3><p>Escolha uma delícia e acompanhe cada etapa nesta tela.</p><button type="button" onClick={aoFechar}>Continuar no cardápio</button></div>}
      <div className="lista-meus-pedidos">{pedidos.map((pedido) => <CardPedido key={pedido.id} pedido={pedido} />)}</div>
    </section>
  </dialog>
}
