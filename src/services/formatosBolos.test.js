import test from 'node:test'
import assert from 'node:assert/strict'
import { imagemDoBolo, prepararBolo, chaveItemCarrinho, precoDoBolo, selecionarBolo } from './formatosBolos.js'

const bolo = { id: 1, categoria: 'Bolos', nome: 'Chocolate', preco: 100, imagem: 'antiga.jpg', imagem_redondo: 'redondo.jpg', imagem_retangular: 'retangular.jpg' }

test('cada formato usa a imagem correta e mantém o preço cadastrado', () => {
  for (const formato of ['Redondo', 'Retangular']) {
    const item = prepararBolo({ ...bolo, formato })
    assert.equal(item.imagem, `${formato.toLowerCase()}.jpg`)
    assert.equal(item.preco, 100)
    assert.equal(item.nome, `Chocolate — ${formato.toLowerCase()} P`)
    assert.equal(item.id, bolo.id)
    assert.deepEqual(prepararBolo(item), item)
  }
})

test('redondo e retangular são itens diferentes no carrinho', () => {
  const redondo = { ...prepararBolo(bolo), tipo: 'produto' }
  const retangular = { ...prepararBolo({ ...bolo, formato: 'Retangular' }), tipo: 'produto' }
  assert.notEqual(chaveItemCarrinho(redondo), chaveItemCarrinho(retangular))
  assert.equal(chaveItemCarrinho(redondo), chaveItemCarrinho({ ...bolo, tipo: 'produto' }))
  const itens = [redondo, retangular]
  assert.deepEqual(itens.filter((item) => chaveItemCarrinho(item) !== chaveItemCarrinho(redondo)), [retangular])
})

test('catálogo antigo preserva foto redonda sem inventar foto retangular', () => {
  const antigo = { categoria: 'Bolos', nome: 'Bolo antigo', imagem: 'antiga.jpg' }
  assert.equal(imagemDoBolo(antigo, 'Redondo'), 'antiga.jpg')
  assert.equal(imagemDoBolo(antigo, 'Retangular'), undefined)
})

test('não modifica doces nem bolos personalizados', () => {
  for (const produto of [{ categoria: 'Docinhos', nome: 'Brigadeiro' }, { ...bolo, personalizado: true }]) {
    assert.deepEqual(prepararBolo(produto), produto)
  }
})

test('P, M e G usam preços próprios nos dois formatos sem misturar itens', () => {
  const produto = { ...bolo, preco_p: '100.00', preco_m: '160.00', preco_g: '220.00' }
  const chaves = new Set()
  for (const formato of ['Redondo', 'Retangular']) {
    for (const [tamanho, preco] of [['P', 100], ['M', 160], ['G', 220]]) {
      const selecionado = selecionarBolo(produto, formato, tamanho)
      const item = { ...prepararBolo(selecionado), tipo: 'produto' }
      assert.equal(selecionado.preco, preco)
      assert.equal(item.preco, preco)
      assert.equal(item.tamanho, tamanho)
      assert.equal(item.nome, `Chocolate — ${formato.toLowerCase()} ${tamanho}`)
      assert.equal(item.imagem, `${formato.toLowerCase()}.jpg`)
      assert.deepEqual(prepararBolo(item), item)
      chaves.add(chaveItemCarrinho(item))
    }
  }
  assert.equal(chaves.size, 6)
})

test('não inventa preços para tamanhos não cadastrados', () => {
  assert.equal(precoDoBolo(bolo, 'P'), 100)
  assert.equal(precoDoBolo(bolo, 'M'), null)
  assert.equal(precoDoBolo(bolo, 'G'), null)
  assert.throws(() => prepararBolo({ ...bolo, tamanho: 'M' }), /tamanho.*disponível/)
})
