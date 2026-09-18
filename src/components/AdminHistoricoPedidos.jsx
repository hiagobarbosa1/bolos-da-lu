import { dataAdmin, diaAdmin, moedaAdmin } from '../services/consultasAdmin'

const status = { novo: 'Novo', producao: 'Em produção', pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado' }

export default function AdminHistoricoPedidos({ pedidos }) {
  if (!pedidos.length) return <p className="consulta-vazia">Nenhum pedido encontrado.</p>
  return <div className="historico-admin">{pedidos.map((pedido) => <details key={pedido.id}>
    <summary><span><b>Pedido #{pedido.id}</b><small>{dataAdmin(pedido.criado_em)} · {status[pedido.status] || pedido.status}</small></span><strong>{moedaAdmin(pedido.valor_total)}</strong></summary>
    <div className="historico-admin-conteudo">
      <p><b>Cliente:</b> {pedido.usuarios?.nome || 'Cliente não disponível'}</p>
      <p><b>Pagamento:</b> {pedido.forma_pagamento || 'Não informado'}{pedido.forma_pagamento === 'Pix' && (pedido.pagamento_confirmado_em ? ' · Recebimento confirmado' : ' · Aguardando confirmação')}</p>
      <p><b>Data prevista:</b> {diaAdmin(pedido.data_entrega)}</p>
      {pedido.endereco && <p><b>Entrega / retirada:</b> {pedido.endereco}</p>}
      {pedido.observacao && <p><b>Observações:</b> {pedido.observacao}</p>}
      <h4>Itens do pedido</h4>
      {pedido.itens_pedido?.length ? <ul>{pedido.itens_pedido.map((item, indice) => <li key={item.id || indice}>
        <b>{item.quantidade} × {item.nome_produto || item.produtos?.nome || 'Produto não disponível'}</b>
        {[['Tamanho', item.tamanho], ['Sabor', item.sabor], ['Recheio', item.recheio], ['Cobertura', item.cobertura], ['Decoração', item.decoracao], ['Observações', item.observacao]].filter(([, valor]) => valor).map(([rotulo, valor]) => <small key={rotulo}>{rotulo}: {valor}</small>)}
      </li>)}</ul> : <p>Os itens deste pedido não estão disponíveis.</p>}
    </div>
  </details>)}</div>
}
