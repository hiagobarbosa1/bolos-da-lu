import { useEffect, useState } from 'react'
import { previsaoEntrega } from '../services/horariosRetirada'
import './AgendamentoRetirada.css'

export default function PrevisaoEntrega({ criadoEm }) {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    if (criadoEm) return
    const atualizar = () => setAgora(new Date())
    const intervalo = window.setInterval(atualizar, 1000)
    window.addEventListener('focus', atualizar)
    return () => { window.clearInterval(intervalo); window.removeEventListener('focus', atualizar) }
  }, [criadoEm])
  const previsao = previsaoEntrega(criadoEm ? new Date(criadoEm) : agora)
  return <div className="agendamento-retirada previsao-entrega">
    <span className="icone-agendamento" aria-hidden="true"><svg width="19" height="19" style={{ width: 19, height: 19, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg></span><div className="agendamento-titulo"><b>Previsão de entrega</b><span>Pronta entrega · Hoje</span></div>
    {previsao ? <><strong className="previsao-entrega-hora">Entre {previsao.estimativa}</strong><p>Estimativa de preparo e entrega, no horário de Brasília. Pode variar conforme a confirmação do pagamento e a demanda.</p></> : <p>Não há mais prazo disponível para entregar hoje. A pronta entrega está indisponível no momento.</p>}
  </div>
}
