export const tiposDocinhos = [
  { nome: 'Doces tradicionais', preco: 120 },
  { nome: 'Doces gourmet', preco: 140 },
]

export const quantidadesDocinhos = [25, 50, 75, 100]

export function tipoDocinho(produto) {
  if (!['Docinhos', 'Doces'].includes(produto.categoria)) return null
  return tiposDocinhos.find((tipo) => tipo.preco === Number(produto.preco)) || null
}

export function prepararDocinho(produto) {
  if ((produto.vendaDocinhos || tipoDocinho(produto)) && !quantidadesDocinhos.includes(Number(produto.quantidade))) {
    throw new Error('Selecione a quantidade antes de adicionar ao carrinho.')
  }
  if (produto.vendaDocinhos) return produto
  const tipo = tipoDocinho(produto)
  return tipo ? {
    ...produto,
    preco: tipo.preco / 100,
    precoCento: tipo.preco,
    vendaDocinhos: true,
    quantidade: Number(produto.quantidade),
  } : produto
}
