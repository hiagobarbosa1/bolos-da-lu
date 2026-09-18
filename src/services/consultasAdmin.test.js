import test from 'node:test'
import assert from 'node:assert/strict'
import { periodoRelatorio, relatorioVendas, resumoVendas, buscarClientes, pedidosDoCliente } from './consultasAdmin.js'
import { listarTodasPaginas } from './listarTodasPaginas.js'

test('períodos incluem semanas entre anos e fevereiro bissexto', () => {
  assert.deepEqual(periodoRelatorio('diario', '2026-09-18'), { inicio: '2026-09-18', fim: '2026-09-18' })
  assert.deepEqual(periodoRelatorio('semanal', '2026-01-04'), { inicio: '2025-12-29', fim: '2026-01-04' })
  assert.deepEqual(periodoRelatorio('mensal', '2024-02'), { inicio: '2024-02-01', fim: '2024-02-29' })
  assert.equal(periodoRelatorio('diario', '2026-02-30'), null)
  assert.equal(periodoRelatorio('mensal', ''), null)
})

test('relatório usa data de criação em Brasília com limites inclusivos e exclui cancelados das vendas', () => {
  const pedidos = [
    { id: 1, criado_em: '2026-09-18T02:59:59Z', valor_total: 1000, status: 'entregue' },
    { id: 2, criado_em: '2026-09-18T03:00:00Z', data_entrega: '2026-10-01', valor_total: '30.10', status: 'novo' },
    { id: 3, criado_em: '2026-09-19T02:59:59Z', valor_total: '60.20', status: 'entregue' },
    { id: 4, criado_em: '2026-09-18T12:00:00Z', valor_total: 140, status: 'cancelado' },
    { id: 5, criado_em: '2026-09-19T03:00:00Z', valor_total: 1000, status: 'novo' },
  ]
  const resultado = relatorioVendas(pedidos, periodoRelatorio('diario', '2026-09-18'))
  assert.equal(resultado.total, 90.3)
  assert.equal(resultado.quantidade, 3)
  assert.equal(resultado.cancelados, 1)
  assert.equal(resultado.ticket, 45.15)
  assert.deepEqual(resultado.pedidos.map((pedido) => pedido.id), [2, 3, 4])
})

test('dias sem vendas aparecem zerados e todos cancelados não produzem ticket inválido', () => {
  const vazio = relatorioVendas([], periodoRelatorio('mensal', '2026-02'))
  assert.equal(vazio.dias.length, 28)
  assert.equal(vazio.total, 0)
  assert.equal(vazio.ticket, 0)
  assert.equal(resumoVendas([{ status: 'cancelado', valor_total: 10 }]).ticket, 0)
})

test('busca ignora acentos e consulta e-mail e telefone sem formatação', () => {
  const clientes = [{ id: 'a', nome: 'João', email: 'joao@loja.com', telefone: '(11) 98765-4321' }, { id: 'b', nome: 'Maria', email: 'maria@loja.com', telefone: null }]
  assert.equal(buscarClientes(clientes, 'JOAO')[0].id, 'a')
  assert.equal(buscarClientes(clientes, 'maria@')[0].id, 'b')
  assert.equal(buscarClientes(clientes, '11987654321')[0].id, 'a')
  assert.equal(buscarClientes(clientes, '').length, 2)
  assert.equal(buscarClientes(clientes, 'sem resultado').length, 0)
})

test('histórico usa ID do cliente e ordena do mais recente sem alterar a lista original', () => {
  const pedidos = [{ id: 1, usuario_id: 'a', criado_em: '2026-01-01' }, { id: 2, usuario_id: 'b', criado_em: '2026-03-01' }, { id: 3, usuario_id: 'a', criado_em: '2026-02-01' }]
  assert.deepEqual(pedidosDoCliente(pedidos, 'a').map((item) => item.id), [3, 1])
  assert.deepEqual(pedidosDoCliente(pedidos, 'c'), [])
  assert.equal(pedidos[0].id, 1)
})

test('consulta lê todas as páginas e propaga falhas sem devolver um relatório parcial', async () => {
  const dados = Array.from({ length: 1201 }, (_, id) => ({ id }))
  const consulta = () => ({ range: async (inicio, fim) => ({ data: dados.slice(inicio, fim + 1), error: null }) })
  assert.deepEqual(await listarTodasPaginas(consulta), dados)
  await assert.rejects(listarTodasPaginas(() => ({ range: async (inicio) => inicio === 0 ? { data: dados.slice(0, 500) } : { error: new Error('Falha na segunda página') } })), /segunda página/)
})
