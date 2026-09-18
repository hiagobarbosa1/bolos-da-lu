export const formatosBolos = ['Redondo', 'Retangular']
export const tamanhosBolos = ['P', 'M', 'G']

export function precoDoBolo(produto, tamanho = 'P') {
  if (!tamanhosBolos.includes(tamanho)) return null
  const valor = produto[`preco_${tamanho.toLowerCase()}`] ?? (tamanho === 'P' ? produto.preco : null)
  return valor !== null && valor !== '' && Number.isFinite(Number(valor)) && Number(valor) >= 0 ? Number(valor) : null
}

export function selecionarBolo(produto, formato = 'Redondo', tamanho = 'P') {
  return { ...produto, formato, tamanho, imagem: imagemDoBolo(produto, formato), preco: precoDoBolo(produto, tamanho) }
}

export function imagemDoBolo(produto, formato = 'Redondo') {
  if (produto.categoria !== 'Bolos' || produto.personalizado) return produto.imagem
  return formato === 'Retangular' ? produto.imagem_retangular : produto.imagem_redondo || produto.imagem
}

export function prepararBolo(produto) {
  if (produto.categoria !== 'Bolos' || produto.personalizado) return produto
  const formato = formatosBolos.includes(produto.formato) ? produto.formato : 'Redondo'
  const tamanho = produto.tamanho || 'P'
  const preco = precoDoBolo(produto, tamanho)
  if (preco === null) throw new Error('Selecione um tamanho de bolo disponível.')
  const nomeBase = produto.nomeBase || produto.nome
  return { ...produto, nomeBase, nome: `${nomeBase} — ${formato.toLowerCase()} ${tamanho}`, formato, tamanho, preco, imagem: imagemDoBolo(produto, formato) }
}

export function chaveItemCarrinho(item) {
  const formato = item.tipo === 'produto' && item.categoria === 'Bolos' && !item.personalizado ? item.formato || 'Redondo' : ''
  return `${item.tipo}:${item.id}:${formato}:${formato ? item.tamanho || 'P' : ''}`
}
