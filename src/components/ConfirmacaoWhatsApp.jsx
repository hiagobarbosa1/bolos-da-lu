import { useEffect, useRef } from 'react'
import { criarResumoWhatsApp, linkWhatsApp } from '../services/whatsappService'
import './ConfirmacaoWhatsApp.css'
import PagamentoPix from './PagamentoPix'
import PrevisaoEntrega from './PrevisaoEntrega'

export default function ConfirmacaoWhatsApp({ dados, aoFechar }) {
  const fecharRef = useRef(null)
  const pix = (dados.formaPagamento || dados.pedido.forma_pagamento) === 'Pix'
  const pendente = pix && !dados.pedido.pagamento_confirmado_em
  const link = dados.itens ? linkWhatsApp(criarResumoWhatsApp(dados)) : null
  useEffect(() => { const anterior = document.activeElement; fecharRef.current?.focus(); return () => anterior?.focus() }, [])
  function teclado(event) {
    if (event.key === 'Escape') aoFechar()
    if (event.key !== 'Tab') return
    const elementos = event.currentTarget.querySelectorAll('button, a[href], input')
    const primeiro = elementos[0]; const ultimo = elementos[elementos.length - 1]
    if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo.focus() }
    if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus() }
  }
  return <div className="confirmacao-fundo" onMouseDown={aoFechar}>
    <section className="confirmacao-pedido" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao" onKeyDown={teclado} onMouseDown={(event) => event.stopPropagation()}>
      <header className="confirmacao-topo"><span>BOLOS DA LU · PEDIDO #{dados.pedido.id}</span><button ref={fecharRef} type="button" onClick={aoFechar} aria-label="Fechar confirmação">×</button></header>
      <div className="confirmacao-conteudo">
        <span className={pendente ? 'confirmacao-status pendente' : 'confirmacao-status'}>{pendente ? '◷ Aguardando pagamento' : '✓ Pedido registrado'}</span>
        <h2 id="titulo-confirmacao">{pendente ? 'Só falta o Pix.' : 'Pedido recebido!'}</h2>
        <p className="confirmacao-descricao">{pendente ? 'Finalize o pagamento para que a doceria possa confirmar seu pedido.' : 'Acompanhe cada etapa em Meus pedidos.'}</p>
        {dados.pedido.endereco?.includes('agendada:') && <p className="confirmacao-descricao"><b>{dados.pedido.endereco}</b></p>}
        {dados.modalidade === 'entrega' && dados.itens?.length > 0 && dados.itens.every((item) => item.tipo === 'pronta_entrega') && <PrevisaoEntrega criadoEm={dados.pedido.criado_em} />}
        {pendente && <PagamentoPix total={Number(dados.pedido.valor_total)} pedidoRegistrado />}
        {dados.formaPagamento === 'Dinheiro' && <p className="confirmacao-descricao">Pagamento em dinheiro na entrega ou retirada.</p>}
        {link && <a className="confirmacao-whatsapp" href={link} target="_blank" rel="noreferrer">Falar com a doceria no WhatsApp ↗</a>}
        <button className="confirmacao-continuar" type="button" onClick={aoFechar}>Continuar navegando</button>
      </div>
    </section>
  </div>
}
