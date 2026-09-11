export function pixPendente(pedido) {
  return pedido.forma_pagamento === 'Pix' && !pedido.pagamento_confirmado_em && pedido.status !== 'cancelado'
}
