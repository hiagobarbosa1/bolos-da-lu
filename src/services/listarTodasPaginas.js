export async function listarTodasPaginas(criarConsulta, tamanho = 500) {
  const registros = []
  for (let inicio = 0; ; inicio += tamanho) {
    const { data, error } = await criarConsulta().range(inicio, inicio + tamanho - 1)
    if (error) throw error
    registros.push(...(data || []))
    if (!data || data.length < tamanho) return registros
  }
}
