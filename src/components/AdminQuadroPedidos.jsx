import { useState } from 'react'
import { tipoPedido, prazoPedido, prioridadePedido } from '../services/quadroPedidos'
import { moedaAdmin, dataAdmin } from '../services/consultasAdmin'
import './AdminQuadroPedidos.css'

const etapas = [['novo', 'Novos'], ['producao', 'Em produção'], ['pronto', 'Prontos'], ['entregue', 'Finalizados']]
const aberto = (pedido) => !['entregue', 'cancelado'].includes(pedido.status)

export default function AdminQuadroPedidos({ pedidos, estado, aoAtualizar, agora, pedidoArrastado, colunaDestino, aoArrastar, aoDestino, aoStatus, aoConfirmarPix, confirmandoPix }) {
  const [tipo, setTipo] = useState('encomenda')
  const tipos = [['encomenda', 'Encomendas'], ['pronta_entrega', 'Pronta entrega'], ...(pedidos.some((pedido) => tipoPedido(pedido) === 'outros') ? [['outros', 'A conferir']] : [])]
  const lista = pedidos.filter((pedido) => tipoPedido(pedido) === tipo)
  const pendentes = lista.filter(aberto)
  return <div className="admin-quadro-pedidos">
    <div className="pedidos-toolbar"><div className="pedidos-tipos" role="group" aria-label="Tipo de pedido">{tipos.map(([valor, rotulo]) => <button type="button" key={valor} aria-pressed={tipo === valor} onClick={() => { setTipo(valor); aoArrastar(null); aoDestino(null) }}>{rotulo}<span>{pedidos.filter((pedido) => tipoPedido(pedido) === valor && aberto(pedido)).length} em aberto</span></button>)}</div><button type="button" className="pedidos-atualizar" disabled={estado === 'carregando'} onClick={aoAtualizar}>Atualizar</button></div>
    {estado === 'carregando' ? <p role="status">Carregando pedidos…</p> : estado === 'erro' ? <p className="erro" role="alert">Não foi possível carregar os pedidos. Clique em Atualizar para tentar novamente.</p> : <>
      <div className="pedidos-resumo"><span><b>{pendentes.length}</b> em aberto</span><span><b>{pendentes.filter((pedido) => pedido.status === 'pronto').length}</b> prontos</span><span><b>{pendentes.filter((pedido) => pedido.forma_pagamento === 'Pix' && !pedido.pagamento_confirmado_em).length}</b> Pix pendentes</span></div>
      <p className="pedidos-instrucao">{tipo === 'outros' ? 'Estes pedidos têm itens sem classificação ou de tipos diferentes. Confira os detalhes.' : 'Pedidos em aberto ordenados pelo prazo mais próximo.'} Arraste pela alça ou use “Status” para mover.</p>
      <div className="quadro quadro-pedidos">{etapas.map(([status, titulo]) => {
        const coluna = lista.filter((pedido) => status === 'entregue' ? !aberto(pedido) : pedido.status === status).sort((a, b) => status === 'entregue' ? new Date(b.criado_em) - new Date(a.criado_em) : prioridadePedido(a) - prioridadePedido(b))
        return <div key={status} className={`coluna ${colunaDestino === status ? 'coluna-destino' : ''}`} onPointerEnter={() => { if (pedidoArrastado) aoDestino(status) }} onPointerLeave={() => { if (pedidoArrastado && colunaDestino === status) aoDestino(null) }}>
          <h2>{titulo}<span>{coluna.length}</span></h2>
          {!coluna.length && <p className="coluna-pedidos-vazia">Nenhum pedido</p>}
          {coluna.map((pedido) => {
            const prazo = prazoPedido(pedido)
            const atraso = aberto(pedido) && prazo.limite !== null && agora > prazo.limite
            const pixPendente = pedido.forma_pagamento === 'Pix' && !pedido.pagamento_confirmado_em
            return <article key={pedido.id} className={`pedido-operacional ${pedidoArrastado === pedido.id ? 'arrastando' : ''} ${atraso ? 'pedido-atrasado' : ''}`}>
              <span className="alca-arraste" onPointerDown={(event) => { event.preventDefault(); aoArrastar(pedido.id); aoDestino(null) }} title="Arrastar pedido" aria-hidden="true">⋮⋮</span>
              <div className="pedido-identificacao"><b>#{pedido.id}</b><strong>{moedaAdmin(pedido.valor_total)}</strong></div>
              <h3>{pedido.usuarios?.nome || 'Cliente não disponível'}</h3>
              <div className={`pedido-prazo ${atraso ? 'prazo-atrasado' : ''}`}><span>{prazo.modalidade}{prazo.estimado ? ' · previsão' : ' · agendamento'}</span><b>{prazo.texto}</b>{atraso && <em>Prazo ultrapassado</em>}{!aberto(pedido) && <em>{pedido.status === 'cancelado' ? 'Pedido cancelado' : 'Pedido finalizado'}</em>}</div>
              <ul className="pedido-itens-destaque">{pedido.itens_pedido?.map((item, indice) => <li key={item.id || indice}><b>{item.quantidade}×</b><span>{item.nome_produto || item.produtos?.nome || 'Produto não informado'}{item.tamanho && <small>Tamanho {item.tamanho}</small>}</span></li>)}</ul>
              {!pedido.itens_pedido?.length && <p>Itens não disponíveis</p>}
              <div className={`pedido-pagamento ${pixPendente ? 'pix-pendente' : ''}`}><span>{pedido.forma_pagamento || 'Pagamento não informado'}</span>{pedido.forma_pagamento === 'Pix' && <b>{pixPendente ? 'A confirmar' : 'Recebido'}</b>}</div>
              {pixPendente && pedido.status !== 'cancelado' && <button type="button" className="confirmar-pix-admin" disabled={confirmandoPix !== null} onClick={() => aoConfirmarPix(pedido.id)}>{confirmandoPix === pedido.id ? 'Confirmando…' : 'Confirmar recebimento do Pix'}</button>}
              <details className="pedido-detalhes"><summary>Ver detalhes</summary><p><b>Realizado:</b> {dataAdmin(pedido.criado_em)}</p><p><b>Telefone:</b> {pedido.usuarios?.telefone || 'Não informado'}</p>{pedido.endereco && <p><b>Entrega / retirada:</b> {pedido.endereco}</p>}{pedido.observacao && <p>{pedido.observacao}</p>}{pedido.itens_pedido?.map((item, indice) => <div key={item.id || indice}><b>{item.nome_produto || item.produtos?.nome || 'Produto'}</b>{[['Sabor', item.sabor], ['Recheio', item.recheio], ['Cobertura', item.cobertura], ['Decoração', item.decoracao], ['Observações', item.observacao]].filter(([, valor]) => valor).map(([rotulo, valor]) => <p key={rotulo}>{rotulo}: {valor}</p>)}</div>)}</details>
              <label className="pedido-status">Status<select value={pedido.status} onChange={(event) => aoStatus(pedido.id, event.target.value)}>{etapas.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}{pedido.status === 'cancelado' && <option value="cancelado">Cancelado</option>}</select></label>
            </article>
          })}
        </div>
      })}</div>
    </>}
  </div>
}
