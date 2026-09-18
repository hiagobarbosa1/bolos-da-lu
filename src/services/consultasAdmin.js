import { diaNaDoceria } from './horariosRetirada.js'

export const moedaAdmin = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const dataAdmin = (valor) => valor ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor)) : 'Não informado'
export const diaAdmin = (dia) => dia?.split('-').reverse().join('/') || 'Não informado'

export function periodoRelatorio(tipo, referencia) {
  const dia = tipo === 'mensal' ? `${referencia}-01` : referencia
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null
  const inicio = new Date(`${dia}T12:00:00Z`)
  if (Number.isNaN(inicio.getTime()) || inicio.toISOString().slice(0, 10) !== dia) return null
  if (tipo === 'semanal') inicio.setUTCDate(inicio.getUTCDate() - (inicio.getUTCDay() + 6) % 7)
  const fim = new Date(inicio)
  if (tipo === 'mensal') fim.setUTCMonth(fim.getUTCMonth() + 1, 0)
  if (tipo === 'semanal') fim.setUTCDate(fim.getUTCDate() + 6)
  return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) }
}

export function resumoVendas(pedidos) {
  const validos = pedidos.filter((pedido) => pedido.status !== 'cancelado')
  const centavos = validos.reduce((total, pedido) => total + Math.round(Number(pedido.valor_total || 0) * 100), 0)
  return { quantidade: pedidos.length, cancelados: pedidos.length - validos.length, total: centavos / 100, ticket: validos.length ? centavos / validos.length / 100 : 0 }
}

export function relatorioVendas(pedidos, periodo) {
  if (!periodo) return null
  const dias = new Map()
  const cursor = new Date(`${periodo.inicio}T12:00:00Z`)
  while (cursor.toISOString().slice(0, 10) <= periodo.fim) {
    dias.set(cursor.toISOString().slice(0, 10), [])
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  const selecionados = []
  for (const pedido of pedidos) {
    if (!pedido.criado_em || Number.isNaN(new Date(pedido.criado_em).getTime())) continue
    const dia = diaNaDoceria(new Date(pedido.criado_em))
    if (dias.has(dia)) { dias.get(dia).push(pedido); selecionados.push(pedido) }
  }
  return { ...resumoVendas(selecionados), pedidos: selecionados, dias: [...dias].map(([dia, lista]) => ({ dia, ...resumoVendas(lista) })) }
}

const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function buscarClientes(clientes, busca) {
  const termo = normalizar(busca).trim()
  const telefone = termo.replace(/\D/g, '')
  return clientes.filter((cliente) => [cliente.nome, cliente.email, cliente.telefone].some((valor) => normalizar(valor).includes(termo)) ||
    (telefone.length > 0 && /^[\d\s()+.-]+$/.test(termo) && String(cliente.telefone || '').replace(/\D/g, '').includes(telefone)))
}

export function pedidosDoCliente(pedidos, clienteId) {
  return pedidos.filter((pedido) => pedido.usuario_id === clienteId).sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
}
