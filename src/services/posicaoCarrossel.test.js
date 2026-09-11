import test from 'node:test'
import assert from 'node:assert/strict'
import { posicaoFoto } from './posicaoCarrossel.js'

test('centraliza uma foto única e distribui as demais sem duplicação', () => {
  for (let total = 1; total <= 12; total++) {
    for (let atual = 0; atual < total; atual++) {
      const posicoes = Array.from({ length: total }, (_, indice) => posicaoFoto(indice, atual, total))
      assert.equal(posicoes[atual], 0)
      assert.equal(new Set(posicoes).size, total)
      assert.equal(posicoes.filter((posicao) => Math.abs(posicao) <= 3).length, Math.min(total, 7))
    }
  }
})

test('a última foto fica à esquerda da primeira e a primeira à direita da última', () => {
  assert.equal(posicaoFoto(4, 0, 5), -1)
  assert.equal(posicaoFoto(0, 4, 5), 1)
  assert.deepEqual([0, 1, 2, 3, 4].map((indice) => posicaoFoto(indice, 2, 5)), [-2, -1, 0, 1, 2])
})
