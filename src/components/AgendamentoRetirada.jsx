import { useEffect, useState } from 'react'
import { diaNaDoceria, diaSeguinte, horariosPedido, primeiroDiaPedido } from '../services/horariosRetirada'
import './AgendamentoRetirada.css'

export default function AgendamentoRetirada({ prontaEntrega = false, modalidade = 'retirada' }) {
  const [agora, setAgora] = useState(() => new Date())
  const [diaEscolhido, setDiaEscolhido] = useState('')
  const [horaEscolhida, setHoraEscolhida] = useState('')
  const hoje = diaNaDoceria(agora)
  const minimo = prontaEntrega ? hoje : diaSeguinte(agora)
  const dia = prontaEntrega ? hoje : diaEscolhido >= minimo ? diaEscolhido : primeiroDiaPedido(false, agora)
  const horarios = horariosPedido(dia, prontaEntrega, agora)
  const hora = dia === diaEscolhido && horarios.includes(horaEscolhida) ? horaEscolhida : ''

  useEffect(() => {
    const atualizar = () => setAgora(new Date())
    const intervalo = window.setInterval(atualizar, 1000)
    window.addEventListener('focus', atualizar)
    return () => { window.clearInterval(intervalo); window.removeEventListener('focus', atualizar) }
  }, [])

  return <div className="agendamento-retirada">
    <span className="icone-agendamento" aria-hidden="true"><svg width="19" height="19" style={{ width: 19, height: 19, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v5M16 3v5M4 11h16"/></svg></span><div className="agendamento-titulo"><b>{modalidade === 'retirada' ? 'Quando você vai retirar?' : 'Quando você quer receber?'}</b><span>{prontaEntrega ? 'Pronta entrega · Hoje' : 'Encomenda · A partir de amanhã'}</span></div>
    <p>{prontaEntrega ? 'Escolha um horário para hoje, com pelo menos 1 hora de antecedência.' : 'Amanhã, somente a partir das 16h. Nos dias seguintes, todos os horários de funcionamento. Horário de Brasília.'}</p>
    <p>{prontaEntrega ? 'Quarta a sexta: 13h às 20h.' : 'Segunda a sexta: 13h às 20h.'} Sábado e domingo: 14h às 20h.</p>
    <div className="agendamento-campos">
      <label>{modalidade === 'retirada' ? 'Dia da retirada' : 'Dia da entrega'}<input required type="date" name="dataEntrega" min={minimo} max={prontaEntrega ? hoje : undefined} readOnly={prontaEntrega} value={dia} onChange={(event) => { setDiaEscolhido(event.target.value); setHoraEscolhida('') }} /></label>
      <label>{modalidade === 'retirada' ? 'Horário da retirada' : 'Horário da entrega'}<select required name="horarioRetirada" value={hora} onChange={(event) => { setDiaEscolhido(dia); setHoraEscolhida(event.target.value) }} aria-describedby="disponibilidade-retirada"><option value="" disabled>Selecione</option>{horarios.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}</select></label>
    </div>
    <small id="disponibilidade-retirada" className={horarios.length ? 'horarios-disponiveis' : 'horarios-indisponiveis'} role="status">{!horarios.length && <span aria-hidden="true">!</span>}{horarios.length ? `Primeiro horário disponível neste dia: ${horarios[0]}.` : prontaEntrega ? 'Não há mais horários para hoje. A pronta entrega está indisponível no momento.' : 'Não há horários neste dia. Selecione outra data.'}</small>
  </div>
}
