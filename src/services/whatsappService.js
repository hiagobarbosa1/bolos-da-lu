const numeroDoceria = (import.meta.env.VITE_WHATSAPP_DOCERIA || '').replace(/\D/g, '')

export function criarResumoWhatsApp({ pedido, itens, modalidade, dataEntrega, endereco, formaPagamento }) {
  const listaItens = itens.map((item) => `• ${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`).join('\n')
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  return `Olá, Bolos da Lu! ♥\n\n*Pedido #${pedido.id}*\n\n*Itens:*\n${listaItens}\n\n*Total:* R$ ${total.toFixed(2)}\n*Forma de pagamento:* ${formaPagamento || pedido.forma_pagamento || 'Não informada'}\n*Modalidade:* ${modalidade === 'entrega' ? 'Entrega' : 'Retirada'}\n*Data:* ${new Date(`${dataEntrega}T12:00`).toLocaleDateString('pt-BR')}\n*${modalidade === 'entrega' ? 'Endereço' : 'Retirada agendada'}:* ${endereco || 'A combinar'}\n\nPedido enviado pelo site. Aguardo a confirmação da doceria!`
}

export function linkWhatsApp(resumo) {
  if (!numeroDoceria) return null
  return `https://wa.me/${numeroDoceria}?text=${encodeURIComponent(resumo)}`
}
