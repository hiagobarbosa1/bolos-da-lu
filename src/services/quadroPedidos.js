import { previsaoEntrega } from './horariosRetirada.js'

export function tipoPedido(pedido) {
  const itens = pedido.itens_pedido || []
  if (itens.length && itens.every((item) => item.tipo_item === 'pronta_entrega')) return 'pronta_entrega'
  if (itens.length && itens.every((item) => ['produto', 'bolo_personalizado'].includes(item.tipo_item) || (!item.tipo_item && item.produto_id))) return 'encomenda'
  return 'outros'
}

export function prazoPedido(pedido) {
  const endereco = pedido.endereco || ''
  const modalidade = /^retirada/i.test(endereco.trim()) ? 'Retirada' : 'Entrega'
  const agendamento = endereco.match(/(?:retirada|entrega) agendada:\s*(\d{2})\/(\d{2})\/(\d{4})\s+às\s+(\d{2}:\d{2})/i)
  if (agendamento) {
    const [, dia, mes, ano, hora] = agendamento
    return { modalidade, texto: `${dia}/${mes}/${ano} às ${hora}`, limite: new Date(`${ano}-${mes}-${dia}T${hora}:00-03:00`).getTime(), estimado: false }
  }
  if (tipoPedido(pedido) === 'pronta_entrega' && modalidade === 'Entrega' && pedido.criado_em) {
    const criado = new Date(pedido.criado_em)
    if (!Number.isNaN(criado.getTime())) {
      const previsao = previsaoEntrega(criado)
      const fim = previsao?.fim || new Date(criado.getTime() + 2 * 60 * 60 * 1000)
      return { modalidade, texto: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(fim), limite: fim.getTime(), estimado: true }
    }
  }
  return { modalidade, texto: pedido.data_entrega ? `${pedido.data_entrega.split('-').reverse().join('/')} · horário não informado` : 'Prazo não informado', limite: null, estimado: false }
}

export function prioridadePedido(pedido) {
  return prazoPedido(pedido).limite || (pedido.data_entrega ? new Date(`${pedido.data_entrega}T23:59:59-03:00`).getTime() : Infinity)
}
