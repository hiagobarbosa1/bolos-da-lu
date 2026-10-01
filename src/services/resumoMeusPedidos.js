import { prazoPedido } from './quadroPedidos.js'

export const nomeItemPedido = (item) => item.nome_produto || item.produtos?.nome || 'Produto personalizado'
export const moedaPedido = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function dataPedido(valor) {
  const data = valor ? new Date(valor) : null
  return data && !Number.isNaN(data.getTime())
    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(data)
    : 'Data não informada'
}

export function resumoMeusPedidos(pedido) {
  const prazo = prazoPedido(pedido)
  const retirada = /^retirada/i.test((pedido.endereco || '').trim())
  const modalidade = pedido.endereco ? (retirada ? 'Retirada na loja' : 'Entrega') : 'A combinar'
  const titulos = { novo: 'Pedido recebido', producao: 'Em produção', pronto: retirada ? 'Pronto para retirada' : 'Pronto para entrega', entregue: 'Pedido finalizado', cancelado: 'Pedido cancelado' }
  const descricoes = {
    novo: 'Recebemos seu pedido! Acompanhe por aqui as próximas atualizações da loja.',
    producao: 'Estamos preparando suas delícias com muito carinho!',
    pronto: retirada ? 'Seu pedido está pronto! Você já pode retirá-lo no horário combinado.' : 'Seu pedido está pronto e aguardando a entrega.',
    entregue: retirada ? 'Seu pedido foi retirado. Esperamos te ver novamente!' : 'Seu pedido foi entregue. Esperamos te ver novamente!',
    cancelado: 'Este pedido foi cancelado. Fale com a loja se precisar de ajuda.',
  }
  return {
    titulo: titulos[pedido.status] || 'Aguardando atualização',
    descricao: descricoes[pedido.status] || 'Entre em contato com a loja para acompanhar seu pedido.',
    encerrado: ['entregue', 'cancelado'].includes(pedido.status),
    retirada, modalidade,
    agendamento: prazo.texto,
    rotuloAgendamento: prazo.estimado ? 'Estimativa de entrega até' : retirada ? 'Retirada agendada para' : 'Entrega agendada para',
    estimado: prazo.estimado,
    endereco: retirada ? null : (pedido.endereco || '').split(/\s*\|\s*(?:Entrega agendada:|Localização confirmada:)/i)[0].trim() || null,
    pagamento: pedido.forma_pagamento === 'Pix'
      ? pedido.pagamento_confirmado_em ? 'Pix confirmado pela loja' : 'Pix aguardando confirmação da loja'
      : pedido.forma_pagamento === 'Dinheiro' ? 'Pagamento em dinheiro' : pedido.forma_pagamento || 'Forma de pagamento não informada',
  }
}
