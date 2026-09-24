function escaparHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caractere])
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function imprimirNotinha(pedido) {
  const janela = window.open('', '_blank', 'width=430,height=680')
  if (!janela) {
    window.alert('Permita pop-ups neste navegador para imprimir a notinha.')
    return
  }
  const itens = pedido.itens_pedido?.length
    ? pedido.itens_pedido.map((item) => `<li><b>${escaparHtml(item.quantidade)}× ${escaparHtml(item.nome_produto || item.produtos?.nome || 'Produto')}</b>${item.tamanho ? `<small>Tamanho: ${escaparHtml(item.tamanho)}</small>` : ''}${item.observacao ? `<small>${escaparHtml(item.observacao)}</small>` : ''}</li>`).join('')
    : '<li><b>Encomenda personalizada</b></li>'
  const data = pedido.criado_em ? new Date(pedido.criado_em).toLocaleString('pt-BR') : 'Não informada'
  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pedido #${escaparHtml(pedido.id)}</title><style>body{margin:0;padding:24px;color:#2f211d;font:14px Arial,sans-serif}header{text-align:center;border-bottom:1px dashed #92796d;padding-bottom:15px}h1{margin:0;color:#5a3023;font-size:24px}header p{margin:6px 0 0;font-size:12px}.numero{margin:16px 0 4px;font-size:18px;font-weight:bold}.meta{color:#6d554c;font-size:12px;line-height:1.55}.bloco{margin-top:18px;padding-top:14px;border-top:1px dashed #cdbcb3}.bloco b{display:block;margin-bottom:6px}ul{padding:0;margin:0;list-style:none}li{padding:10px 0;border-bottom:1px dotted #decfc7}li b{margin:0}small{display:block;margin-top:4px;color:#705950}.total{display:flex;justify-content:space-between;margin-top:18px;padding-top:14px;border-top:2px solid #4b2a20;font-size:18px;font-weight:bold}@media print{body{padding:10px}}</style></head><body><header><h1>Bolos da Lu</h1><p>Notinha do pedido</p></header><p class="numero">Pedido #${escaparHtml(pedido.id)}</p><p class="meta">Feito em: ${escaparHtml(data)}<br>Cliente: ${escaparHtml(pedido.usuarios?.nome || 'Cliente não informado')}<br>Telefone: ${escaparHtml(pedido.usuarios?.telefone || 'Não informado')}</p><section class="bloco"><b>Itens</b><ul>${itens}</ul></section><section class="bloco"><b>Pagamento</b><span>${escaparHtml(pedido.forma_pagamento || 'Não informado')}</span></section><section class="bloco"><b>Entrega ou retirada</b><span>${escaparHtml(pedido.endereco || 'A combinar')}</span></section>${pedido.observacao ? `<section class="bloco"><b>Observações</b><span>${escaparHtml(pedido.observacao)}</span></section>` : ''}<p class="total"><span>Total</span><span>${escaparHtml(moeda(pedido.valor_total))}</span></p></body></html>`)
  janela.document.close()
  janela.focus()
  window.setTimeout(() => janela.print(), 250)
}
