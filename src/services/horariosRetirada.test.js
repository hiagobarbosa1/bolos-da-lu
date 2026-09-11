import test from 'node:test'
import assert from 'node:assert/strict'
import { diaNaDoceria, horariosRetirada, validarRetirada, proximoDiaRetirada, horariosPedido, primeiroDiaPedido, validarAgendamento, previsaoEntrega } from './horariosRetirada.js'

test('usa o dia de Brasília mesmo quando já é outro dia em UTC', () => {
  assert.equal(diaNaDoceria(new Date('2026-09-12T01:00:00Z')), '2026-09-11')
})

test('arredonda para a próxima opção com pelo menos uma hora de preparo', () => {
  assert.equal(horariosRetirada('2026-09-11', new Date('2026-09-11T14:10:00-03:00'))[0], '15:30')
  assert.equal(horariosRetirada('2026-09-11', new Date('2026-09-11T14:00:00-03:00'))[0], '15:00')
  assert.equal(horariosRetirada('2026-09-11', new Date('2026-09-11T14:00:01-03:00'))[0], '15:30')
})

test('esgota os horários de hoje e libera o dia seguinte respeitando o prazo', () => {
  const agora = new Date('2026-09-11T23:10:00-03:00')
  assert.deepEqual(horariosRetirada('2026-09-11', agora), [])
  assert.equal(horariosRetirada('2026-09-12', agora)[0], '14:00')
})

test('respeita dias fechados, abertura, fechamento e próximo dia disponível', () => {
  const agora = new Date('2026-09-09T09:00:00-03:00')
  assert.equal(horariosRetirada('2026-09-09', agora)[0], '13:00')
  assert.equal(horariosRetirada('2026-09-10', agora)[0], '13:00')
  assert.equal(horariosRetirada('2026-09-11', agora)[0], '13:00')
  assert.equal(horariosRetirada('2026-09-12', agora).at(-1), '20:00')
  assert.equal(horariosRetirada('2026-09-13', agora)[0], '14:00')
  assert.equal(proximoDiaRetirada(new Date('2026-09-13T19:00:01-03:00')), '2026-09-16')
  for (const dia of ['2026-09-14', '2026-09-15']) assert.deepEqual(horariosRetirada(dia, agora), [])
  assert.equal(proximoDiaRetirada(new Date('2026-09-12T19:00:01-03:00')), '2026-09-13')
  assert.deepEqual(horariosRetirada('2026-09-12', new Date('2026-09-12T19:00:00-03:00')), ['20:00'])
})

test('rejeita datas inválidas, passadas e horário que venceu durante o checkout', () => {
  const agora = new Date('2026-09-11T14:20:00-03:00')
  assert.deepEqual(horariosRetirada('2026-02-30', agora), [])
  assert.deepEqual(horariosRetirada('2026-09-10', agora), [])
  assert.throws(() => validarRetirada('2026-09-11', '15:00', agora))
  assert.throws(() => validarRetirada('2026-09-11', '15:45', agora))
  assert.doesNotThrow(() => validarRetirada('2026-09-11', '15:30', agora))
})

test('pronta entrega fica somente hoje, sem transferir para amanhã', () => {
  const agora = new Date('2026-09-09T14:10:00-03:00')
  assert.equal(horariosPedido('2026-09-09', true, agora)[0], '15:30')
  assert.deepEqual(horariosPedido('2026-09-10', true, agora), [])
  const fim = new Date('2026-09-09T19:01:00-03:00')
  assert.equal(primeiroDiaPedido(true, fim), '2026-09-09')
  assert.deepEqual(horariosPedido('2026-09-09', true, fim), [])
})

test('encomenda amanhã só após 16h e nos dias posteriores desde a abertura', () => {
  const agora = new Date('2026-09-09T12:00:00-03:00')
  assert.deepEqual(horariosPedido('2026-09-09', false, agora), [])
  assert.equal(horariosPedido('2026-09-10', false, agora)[0], '16:00')
  assert.equal(horariosPedido('2026-09-11', false, agora)[0], '13:00')
  assert.equal(horariosPedido('2026-09-12', false, agora)[0], '14:00')
  assert.throws(() => validarAgendamento('2026-09-10', '15:30', false, agora))
  assert.doesNotThrow(() => validarAgendamento('2026-09-10', '16:00', false, agora))
})

test('encomenda inclui segunda e recalcula a regra depois da meia-noite', () => {
  assert.equal(primeiroDiaPedido(false, new Date('2026-09-13T12:00:00-03:00')), '2026-09-14')
  assert.equal(horariosPedido('2026-09-16', false, new Date('2026-09-13T12:00:00-03:00'))[0], '13:00')
  assert.throws(() => validarAgendamento('2026-09-11', '13:00', false, new Date('2026-09-10T00:01:00-03:00')))
})

test('previsão calcula 1 a 2 horas e respeita a abertura e o fechamento', () => {
  assert.equal(previsaoEntrega(new Date('2026-09-09T14:10:00-03:00')).estimativa, '15:10 às 16:10')
  assert.equal(previsaoEntrega(new Date('2026-09-09T10:00:00-03:00')).estimativa, '13:00 às 14:00')
  assert.equal(previsaoEntrega(new Date('2026-09-09T18:30:00-03:00')).estimativa, '19:30 às 20:00')
  assert.equal(previsaoEntrega(new Date('2026-09-09T19:00:00-03:00')), null)
  assert.equal(previsaoEntrega(new Date('2026-09-14T14:00:00-03:00')), null)
  assert.equal(previsaoEntrega(new Date('2026-09-09T23:30:00-03:00')), null)
})

test('segunda e terça aceitam apenas encomendas, com restrição de amanhã às 16h', () => {
  const domingo = new Date('2026-09-13T12:00:00-03:00')
  assert.equal(horariosPedido('2026-09-14', false, domingo)[0], '16:00')
  assert.equal(horariosPedido('2026-09-15', false, domingo)[0], '13:00')
  assert.equal(horariosPedido('2026-09-15', false, domingo).at(-1), '20:00')
  assert.throws(() => validarAgendamento('2026-09-14', '13:00', false, domingo))
  assert.doesNotThrow(() => validarAgendamento('2026-09-14', '16:00', false, domingo))
  const segunda = new Date('2026-09-14T12:00:00-03:00')
  assert.equal(horariosPedido('2026-09-15', false, segunda)[0], '16:00')
  for (const dia of ['2026-09-14', '2026-09-15']) {
    const agora = new Date(dia + 'T12:00:00-03:00')
    assert.deepEqual(horariosPedido(dia, true, agora), [])
    assert.equal(previsaoEntrega(agora), null)
  }
})
