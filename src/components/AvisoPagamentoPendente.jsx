import { useEffect, useState } from 'react'
import { acompanharPedidosEmTempoReal, listarMeusPedidos } from '../services/pedidosService'
import { pixPendente } from '../services/pagamentoPendente'
import ConfirmacaoWhatsApp from './ConfirmacaoWhatsApp'
import './AvisoPagamentoPendente.css'

export default function AvisoPagamentoPendente({ usuarioId, pedidoRecenteId, oculto }) {
  const [listaPedidos, setPedidos] = useState([])
  const chaveConfirmacoes = `bolos-da-lu-pix-vistos-${usuarioId}`
  const [confirmacoesVistas, setConfirmacoesVistas] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem(chaveConfirmacoes) || '[]')
      return Array.isArray(salvas) ? salvas : []
    } catch { return [] }
  })
  const [abertoId, setAbertoId] = useState(null)
  useEffect(() => {
    let ativo = true
    let versao = 0
    const atualizar = async () => {
      const atual = ++versao
      try {
        const lista = await listarMeusPedidos()
        if (ativo && atual === versao) setPedidos(lista)
      } catch { /* Mantém o aviso existente durante falhas temporárias de conexão. */ }
    }
    atualizar()
    const parar = acompanharPedidosEmTempoReal(usuarioId, atualizar, 'pix')
    const intervalo = window.setInterval(atualizar, 15000)
    window.addEventListener('focus', atualizar)
    return () => { ativo = false; parar(); window.clearInterval(intervalo); window.removeEventListener('focus', atualizar) }
  }, [usuarioId, pedidoRecenteId])

  const pedidos = listaPedidos.filter(pixPendente)
  const confirmado = listaPedidos.find((item) => item.forma_pagamento === 'Pix' && item.pagamento_confirmado_em && item.status !== 'cancelado' && !confirmacoesVistas.includes(String(item.id)))
  const pedido = pedidos.find((item) => item.id === abertoId)

  function dispensarConfirmacao() {
    const vistas = [...confirmacoesVistas, String(confirmado.id)]
    setConfirmacoesVistas(vistas)
    setAbertoId(null)
    try { localStorage.setItem(chaveConfirmacoes, JSON.stringify(vistas)) } catch { /* Mantém a confirmação dispensada nesta sessão. */ }
  }

  if (oculto) return null
  if (confirmado) return <aside className="aviso-pix-pendente aviso-pix-confirmado" aria-label="Pagamento confirmado">
    <span className="aviso-pix-icone" aria-hidden="true">✓</span>
    <div><div role="status" aria-live="polite"><b>Pix confirmado!</b><p>A doceria recebeu seu pagamento. Acompanhe as próximas etapas em Meus pedidos.</p><small>Pedido #{confirmado.id} · Pagamento recebido</small></div>
      <button type="button" onClick={dispensarConfirmacao}>Entendi <span aria-hidden="true">✓</span></button>
    </div>
  </aside>
  if (!pedidos.length) return null
  return <>
    <aside className="aviso-pix-pendente" aria-label="Pagamento pendente">
      <span className="aviso-pix-icone" aria-hidden="true">◷</span>
      <div><b>Seu pedido aguarda o Pix</b><p>Finalize o pagamento para que a doceria possa confirmar seu pedido.</p>
        <small>{pedidos.length > 1 ? `${pedidos.length} pedidos com pagamento pendente` : `Pedido #${pedidos[0].id} · Aguardando confirmação do Pix`}</small>
        {pedidos.length > 1 && <select aria-label="Ver Pix de outro pedido" value="" onChange={(event) => setAbertoId(pedidos.find((item) => String(item.id) === event.target.value)?.id ?? null)}><option value="" disabled>Escolha um pedido</option>{pedidos.map((item) => <option key={item.id} value={item.id}>Pedido #{item.id} · {Number(item.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>)}</select>}
        <button type="button" onClick={() => setAbertoId(pedidos[0].id)}>Ver dados do Pix <span aria-hidden="true">→</span></button>
      </div>
    </aside>
    {pedido && <ConfirmacaoWhatsApp dados={{ pedido, formaPagamento: 'Pix' }} aoFechar={() => setAbertoId(null)} />}
  </>
}
