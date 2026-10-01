import test from 'node:test'
import assert from 'node:assert/strict'
import { dataPedido, resumoMeusPedidos } from './resumoMeusPedidos.js'

test('retirada pronta mantém modalidade, horário e confirmação Pix independente do status', () => {
  const resumo = resumoMeusPedidos({ status: 'pronto', endereco: 'Retirada agendada: 14/10/2026 às 15:30', forma_pagamento: 'Pix' })
  assert.equal(resumo.titulo, 'Pronto para retirada')
  assert.equal(resumo.agendamento, '14/10/2026 às 15:30')
  assert.equal(resumo.pagamento, 'Pix aguardando confirmação da loja')
  assert.equal(resumo.endereco, null)
  assert.equal(resumo.estimado, false)
})

test('entrega agendada separa endereço dos metadados sem inventar prazo', () => {
  const resumo = resumoMeusPedidos({ status: 'producao', endereco: 'Rua A, 10 — Centro | Localização confirmada: -1, -2 | Entrega agendada: 14/10/2026 às 15:30' })
  assert.equal(resumo.endereco, 'Rua A, 10 — Centro')
  assert.equal(resumo.agendamento, '14/10/2026 às 15:30')
  assert.equal(resumo.estimado, false)
  const semHorario = resumoMeusPedidos({ status: 'novo', data_entrega: '2026-10-14', itens_pedido: [{ tipo_item: 'produto' }] })
  assert.match(semHorario.agendamento, /horário não informado/)
  assert.equal(semHorario.estimado, false)
})

test('somente pronta entrega sem agendamento usa estimativa', () => {
  const resumo = resumoMeusPedidos({ status: 'novo', endereco: 'Rua A, 10', criado_em: '2026-10-01T17:00:00Z', itens_pedido: [{ tipo_item: 'pronta_entrega' }] })
  assert.equal(resumo.estimado, true)
  assert.equal(resumo.rotuloAgendamento, 'Estimativa de entrega até')
})

test('finalizados e cancelados ficam compactos com textos distintos', () => {
  const entregue = resumoMeusPedidos({ status: 'entregue', forma_pagamento: 'Pix', pagamento_confirmado_em: '2026-10-01T17:00:00Z' })
  assert.equal(entregue.encerrado, true)
  assert.equal(entregue.pagamento, 'Pix confirmado pela loja')
  const cancelado = resumoMeusPedidos({ status: 'cancelado' })
  assert.equal(cancelado.titulo, 'Pedido cancelado')
  assert.equal(cancelado.encerrado, true)
  assert.doesNotMatch(cancelado.descricao, /foi entregue/)
})

test('datas respeitam Brasília e toleram dados ausentes', () => {
  assert.match(dataPedido('2026-10-01T02:30:00Z'), /30\/09\/2026/)
  assert.equal(dataPedido(null), 'Data não informada')
  assert.equal(dataPedido('inválida'), 'Data não informada')
})
