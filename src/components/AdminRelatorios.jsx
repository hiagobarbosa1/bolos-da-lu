import { useMemo, useState } from 'react'
import { diaNaDoceria } from '../services/horariosRetirada'
import { diaAdmin, moedaAdmin, periodoRelatorio, relatorioVendas } from '../services/consultasAdmin'
import AdminHistoricoPedidos from './AdminHistoricoPedidos'
import './AdminConsultas.css'

export default function AdminRelatorios({ pedidos, estado, aoAtualizar }) {
  const [tipo, setTipo] = useState('diario')
  const [dia, setDia] = useState(() => diaNaDoceria())
  const referencia = tipo === 'mensal' ? dia.slice(0, 7) : dia
  const periodo = periodoRelatorio(tipo, referencia)
  const relatorio = useMemo(() => relatorioVendas(pedidos, periodoRelatorio(tipo, referencia)), [pedidos, tipo, referencia])
  return <div className="admin-consultas">
    <div className="consulta-filtros">
      <label>Período<select value={tipo} onChange={(event) => setTipo(event.target.value)}><option value="diario">Diário</option><option value="semanal">Semanal</option><option value="mensal">Mensal</option></select></label>
      <label>{tipo === 'mensal' ? 'Mês' : tipo === 'semanal' ? 'Data da semana' : 'Data'}<input type={tipo === 'mensal' ? 'month' : 'date'} value={referencia} onChange={(event) => setDia(tipo === 'mensal' && event.target.value ? `${event.target.value}-01` : event.target.value)} /></label>
      <button type="button" disabled={estado === 'carregando'} onClick={aoAtualizar}>Atualizar dados</button>
    </div>
    <p className="consulta-ajuda">Pedidos pela data de criação, no horário de Brasília. Semanas de segunda a domingo. O total vendido exclui cancelamentos e não representa pagamentos já recebidos.</p>
    {estado === 'carregando' ? <p role="status">Carregando pedidos…</p> : estado === 'erro' ? <p role="alert" className="erro">Não foi possível carregar os pedidos. Tente atualizar os dados.</p> : !relatorio ? <p role="status">Selecione uma data válida para consultar.</p> : <>
      <h2>{diaAdmin(periodo.inicio)}{periodo.fim !== periodo.inicio && ` a ${diaAdmin(periodo.fim)}`}</h2>
      <div className="metricas consulta-metricas">
        <article><b>{moedaAdmin(relatorio.total)}</b><span>TOTAL VENDIDO</span></article>
        <article><b>{relatorio.quantidade}</b><span>PEDIDOS REALIZADOS</span></article>
        <article><b>{relatorio.cancelados}</b><span>PEDIDOS CANCELADOS</span></article>
        <article><b>{moedaAdmin(relatorio.ticket)}</b><span>TICKET MÉDIO SEM CANCELAMENTOS</span></article>
      </div>
      <div className="consulta-tabela"><table><caption>Vendas por dia</caption><thead><tr><th scope="col">Data</th><th scope="col">Pedidos</th><th scope="col">Cancelados</th><th scope="col">Total vendido</th></tr></thead><tbody>{relatorio.dias.map((linha) => <tr key={linha.dia}><th scope="row">{diaAdmin(linha.dia)}</th><td>{linha.quantidade}</td><td>{linha.cancelados}</td><td>{moedaAdmin(linha.total)}</td></tr>)}</tbody></table></div>
      <h2>Pedidos do período</h2><AdminHistoricoPedidos pedidos={relatorio.pedidos} />
    </>}
  </div>
}
