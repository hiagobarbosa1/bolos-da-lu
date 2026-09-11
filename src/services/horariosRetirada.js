const fuso = 'America/Sao_Paulo'
const umaHora = 60 * 60 * 1000
const expediente = { 0: [14, 20], 3: [13, 20], 4: [13, 20], 5: [13, 20], 6: [14, 20] }

export function previsaoEntrega(agora = new Date()) {
  const dia = diaNaDoceria(agora)
  const janela = expediente[new Date(`${dia}T12:00:00-03:00`).getUTCDay()]
  if (!janela) return null
  const abertura = new Date(`${dia}T${janela[0]}:00:00-03:00`).getTime()
  const fechamento = new Date(`${dia}T${janela[1]}:00:00-03:00`).getTime()
  const inicio = new Date(Math.max(agora.getTime() + umaHora, abertura))
  if (inicio.getTime() >= fechamento) return null
  const fim = new Date(Math.min(inicio.getTime() + umaHora, fechamento))
  const formato = new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, hour: '2-digit', minute: '2-digit' })
  return { inicio, fim, estimativa: `${formato.format(inicio)} às ${formato.format(fim)}` }
}

export function diaNaDoceria(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(agora)
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}

export function horariosRetirada(dia, agora = new Date(), porEncomenda = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return []
  const inicioDia = new Date(`${dia}T00:00:00-03:00`)
  if (Number.isNaN(inicioDia.getTime()) || diaNaDoceria(inicioDia) !== dia) return []
  const diaSemana = inicioDia.getUTCDay()
  const janela = porEncomenda && (diaSemana === 1 || diaSemana === 2) ? [13, 20] : expediente[diaSemana]
  if (!janela) return []
  const limite = agora.getTime() + umaHora
  return Array.from({ length: 48 }, (_, indice) => {
    const hora = String(Math.floor(indice / 2)).padStart(2, '0')
    return `${hora}:${indice % 2 ? '30' : '00'}`
  }).filter((hora) => {
    const minutos = Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3))
    return minutos >= janela[0] * 60 && minutos <= janela[1] * 60 && new Date(`${dia}T${hora}:00-03:00`).getTime() >= limite
  })
}

export function proximoDiaRetirada(agora = new Date()) {
  const dia = diaNaDoceria(agora)
  for (let indice = 0; indice < 8; indice++) {
    const data = new Date(`${dia}T12:00:00-03:00`)
    data.setUTCDate(data.getUTCDate() + indice)
    const candidato = diaNaDoceria(data)
    if (horariosRetirada(candidato, agora).length) return candidato
  }
  return dia
}

export function validarRetirada(dia, hora, agora = new Date()) {
  if (!hora || !horariosRetirada(dia, agora).includes(hora)) {
    throw new Error('Escolha um horário de retirada com pelo menos 1 hora de antecedência. Os horários foram atualizados.')
  }
}

export function resumoRetirada(dia, hora) {
  return `Retirada agendada: ${dia.split('-').reverse().join('/')} às ${hora}`
}

export function diaSeguinte(agora = new Date()) {
  const data = new Date(`${diaNaDoceria(agora)}T12:00:00-03:00`)
  data.setUTCDate(data.getUTCDate() + 1)
  return diaNaDoceria(data)
}

export function horariosPedido(dia, prontaEntrega, agora = new Date()) {
  const hoje = diaNaDoceria(agora)
  const amanha = diaSeguinte(agora)
  if (prontaEntrega ? dia !== hoje : dia < amanha) return []
  return horariosRetirada(dia, agora, !prontaEntrega).filter((hora) => prontaEntrega || dia !== amanha || hora >= '16:00')
}

export function primeiroDiaPedido(prontaEntrega, agora = new Date()) {
  if (prontaEntrega) return diaNaDoceria(agora)
  const amanha = diaSeguinte(agora)
  for (let indice = 0; indice < 7; indice++) {
    const data = new Date(`${amanha}T12:00:00-03:00`)
    data.setUTCDate(data.getUTCDate() + indice)
    const dia = diaNaDoceria(data)
    if (horariosPedido(dia, false, agora).length) return dia
  }
  return amanha
}

export function validarAgendamento(dia, hora, prontaEntrega, agora = new Date()) {
  if (!horariosPedido(dia, prontaEntrega, agora).includes(hora)) {
    throw new Error(prontaEntrega
      ? 'Pronta entrega disponível somente hoje, com pelo menos 1 hora de antecedência. Confira os horários disponíveis.'
      : 'Escolha um horário disponível: amanhã a partir das 16h ou, nos dias seguintes, dentro do funcionamento da doceria.')
  }
}
