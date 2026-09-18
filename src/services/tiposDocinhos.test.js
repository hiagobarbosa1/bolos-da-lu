import test from 'node:test'
import assert from 'node:assert/strict'
import { prepararDocinho, quantidadesDocinhos, tipoDocinho } from './tiposDocinhos.js'

test('calcula os quatro valores para doces tradicionais e gourmet', () => {
  for (const [preco, totais] of [[120, [30, 60, 90, 120]], [140, [35, 70, 105, 140]]]) {
    quantidadesDocinhos.forEach((quantidade, indice) => {
      const item = prepararDocinho({ id: 1, categoria: 'Docinhos', preco: String(preco), quantidade })
      assert.equal(item.quantidade, quantidade)
      assert.equal(Number((item.preco * item.quantidade).toFixed(2)), totais[indice])
      assert.equal(item.precoCento, preco)
      assert.equal(item.vendaDocinhos, true)
      assert.deepEqual(prepararDocinho(item), item)
    })
  }
})

test('exige escolha explícita de uma quantidade permitida antes de adicionar', () => {
  for (const quantidade of [undefined, '', 0, 1, 3, 26, 125]) {
    for (const preco of [120, 140]) {
      assert.throws(() => prepararDocinho({ categoria: 'Docinhos', preco, quantidade }), /Selecione a quantidade/)
    }
  }
})

test('preserva outros produtos e doces cuja linha ainda não foi definida', () => {
  for (const produto of [{ categoria: 'Bolos', preco: 120 }, { categoria: 'Docinhos', preco: 80 }]) {
    assert.equal(tipoDocinho(produto), null)
    assert.deepEqual(prepararDocinho(produto), produto)
  }
})
