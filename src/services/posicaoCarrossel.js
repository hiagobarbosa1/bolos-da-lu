export function posicaoFoto(indice, atual, total) {
  const distancia = (indice - atual + total) % total
  return distancia > total / 2 ? distancia - total : distancia
}

