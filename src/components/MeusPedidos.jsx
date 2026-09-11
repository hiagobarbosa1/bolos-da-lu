import { useEffect, useState } from 'react'
import { acompanharPedidosEmTempoReal, listarMeusPedidos, prazoEntregaPedido } from '../services/pedidosService'
import './MeusPedidos.css'

const etapas = [['novo', 'Pedido recebido'], ['producao', 'Em produção'], ['pronto', 'Pronto para retirada ou entrega'], ['entregue', 'Pedido finalizado']]
const nomesStatus = Object.fromEntries(etapas)
const nomeItem = (item) => item.nome_produto || item.produtos?.nome || 'Produto personalizado'

export default function MeusPedidos({ usuario, aoFechar }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null)

  useEffect(() => {
    let ativo = true
    const carregar = async () => {
      try { const resultado = await listarMeusPedidos(); if (ativo) { setPedidos(resultado); setErro('') } }
      catch (e) { if (ativo) setErro(e.message) }
      finally { if (ativo) setCarregando(false) }
    }
    carregar()
    const pararTempoReal = acompanharPedidosEmTempoReal(usuario.id, carregar)
    const intervalo = window.setInterval(carregar, 15000)
    return () => { ativo = false; pararTempoReal(); window.clearInterval(intervalo) }
  }, [usuario.id])

  return <div className="modal-pedidos" onMouseDown={aoFechar}>
    <section className="painel-pedidos" onMouseDown={(e) => e.stopPropagation()}>
      <button className="fechar-pedidos" onClick={aoFechar} aria-label="Fechar meus pedidos">×</button>
      <p className="sobretitulo">ACOMPANHE POR AQUI</p><h2>Meus pedidos</h2>
      <p className="descricao-pedidos">As atualizações feitas pela Bolos da Lu aparecem aqui automaticamente.</p>
      {carregando && <p className="pedidos-vazio">Carregando pedidos...</p>}
      {erro && <p className="erro-pedidos">{erro}</p>}
      {!carregando && !erro && pedidos.length === 0 && <p className="pedidos-vazio">Você ainda não fez nenhum pedido. Quando fizer, poderá acompanhar cada etapa aqui. ♥</p>}
      <div className="lista-meus-pedidos">{pedidos.map((pedido) => {
        const etapaAtual = etapas.findIndex(([status]) => status === pedido.status)
        const cancelado = pedido.status === 'cancelado'
        const prazo = prazoEntregaPedido(pedido.criado_em)
        return <article key={pedido.id} className={cancelado ? 'pedido-cancelado' : ''}>
          <header><div><small>PEDIDO #{pedido.id}</small><h3>{nomesStatus[pedido.status] || pedido.status}</h3></div><strong>R$ {Number(pedido.valor_total || 0).toFixed(2)}</strong></header>
          <p className="itens-pedido">{pedido.itens_pedido?.map((item) => `${item.quantidade}x ${nomeItem(item)}`).join(' · ') || 'Encomenda personalizada'}</p>
          {!cancelado && <div className="linha-status">{etapas.map(([status, titulo], indice) => <div className={indice <= etapaAtual ? 'concluida' : ''} key={status}><i>{indice < etapaAtual ? '✓' : indice + 1}</i><span>{titulo}</span></div>)}</div>}
          {cancelado && <p className="aviso-cancelado">Este pedido foi cancelado. Fale com a confeitaria se precisar de ajuda.</p>}
          <div className="prazo-entrega"><span><b>Pedido feito em</b>{prazo.realizado}</span>{pedido.endereco?.includes('agendada:') ? <span><b>{pedido.endereco.startsWith('Retirada') ? 'Retirada agendada' : 'Entrega agendada'}</b>{pedido.endereco.split('agendada: ')[1]}</span> : <span><b>Estimativa de entrega</b>Entre {prazo.estimativa} </span>}</div>
          <button className="ver-detalhes-pedido" onClick={() => setPedidoDetalhado(pedidoDetalhado === pedido.id ? null : pedido.id)}>{pedidoDetalhado === pedido.id ? 'Ocultar detalhes ↑' : 'Ver detalhes do pedido ↓'}</button>
          {pedidoDetalhado === pedido.id && <div className="detalhes-pedido"><div><b>Itens solicitados</b>{pedido.itens_pedido?.map((item) => <span key={item.id}>{item.quantidade}x {nomeItem(item)}</span>) || <span>Encomenda personalizada</span>}</div><div><b>Status atual</b><span>{nomesStatus[pedido.status] || pedido.status}</span></div><div><b>Forma de pagamento</b><span>{pedido.forma_pagamento || 'Não informada'}{pedido.forma_pagamento === 'Pix' && (pedido.pagamento_confirmado_em ? ' · Recebido' : ' · Aguardando confirmação')}</span></div><div><b>Entrega ou retirada</b><span>{pedido.endereco || 'A combinar'}</span></div>{pedido.observacao && <div><b>Observação</b><span>{pedido.observacao}</span></div>}</div>}
          <footer><span>{pedido.data_entrega ? `Data combinada: ${new Date(`${pedido.data_entrega}T12:00`).toLocaleDateString('pt-BR')}` : 'Data a combinar'}</span><span>{pedido.endereco || 'Retirada ou endereço a combinar'}</span></footer>
        </article>
      })}</div>
    </section>
  </div>
}
