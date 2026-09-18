import test from 'node:test'
import assert from 'node:assert/strict'
import { tipoPedido, prazoPedido, prioridadePedido } from './quadroPedidos.js'

test('separa tipos pelos itens, independentemente de retirada ou entrega', () => {
  assert.equal(tipoPedido({ itens_pedido: [{ tipo_item: 'pronta_entrega' }], endereco: 'Retirada agendada: 19/09/2026 às 16:30' }), 'pronta_entrega')
  assert.equal(tipoPedido({ itens_pedido: [{ tipo_item: 'produto' }, { tipo_item: 'bolo_personalizado' }] }), 'encomenda')
  assert.equal(tipoPedido({ itens_pedido: [{ produto_id: 10 }] }), 'encomenda')
})

test('não classifica registros vazios, desconhecidos ou mistos como encomendas', () => {
  for (const itens of [[], [{}], [{ tipo_item: 'pronta_entrega' }, { tipo_item: 'produto' }]]) {
    assert.equal(tipoPedido({ itens_pedido: itens }), 'outros')
  }
})

test('prazo de retirada respeita dia e hora agendados em Brasília', () => {
  const prazo = prazoPedido({ endereco: 'Retirada agendada: 19/09/2026 às 16:30', criado_em: '2026-09-17T10:00:00Z' })
  assert.equal(prazo.modalidade, 'Retirada')
  assert.equal(prazo.limite, Date.parse('2026-09-19T19:30:00Z'))
  assert.equal(prazo.estimado, false)
})

test('entrega agendada não recebe prazo de delivery imediato', () => {
  const pedido = { endereco: 'Rua das Flores, 1 | Entrega agendada: 20/09/2026 às 15:00', itens_pedido: [{ tipo_item: 'produto' }] }
  assert.equal(prazoPedido(pedido).limite, Date.parse('2026-09-20T18:00:00Z'))
  assert.equal(prazoPedido(pedido).modalidade, 'Entrega')
  assert.equal(prioridadePedido(pedido), Date.parse('2026-09-20T18:00:00Z'))
})

test('somente delivery de pronta entrega recebe estimativa automática', () => {
  const pedido = { endereco: 'Rua A, 10', criado_em: '2026-09-18T16:00:00Z', data_entrega: '2026-09-19' }
  assert.equal(prazoPedido({ ...pedido, itens_pedido: [{ tipo_item: 'pronta_entrega' }] }).estimado, true)
  const encomenda = prazoPedido({ ...pedido, itens_pedido: [{ tipo_item: 'produto' }] })
  assert.equal(encomenda.limite, null)
  assert.match(encomenda.texto, /19\/09\/2026/)
})
