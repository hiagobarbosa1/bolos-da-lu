import { useEffect, useRef, useState } from 'react'
import { listarGaleriaBolos } from '../services/galeriaBolosService'
import './CarrosselBolos.css'
import { posicaoFoto } from '../services/posicaoCarrossel'

export default function CarrosselBolos() {
  const [fotos, setFotos] = useState([])
  const [atual, setAtual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [interagindo, setInteragindo] = useState(false)
  const [foco, setFoco] = useState(false)
  const [reduzir, setReduzir] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visivel, setVisivel] = useState(true)
  const gesto = useRef(null)
  const palcoRef = useRef(null)
  const bloquearClique = useRef(false)
  const [arrastando, setArrastando] = useState(false)
  useEffect(() => {
    let ativo = true
    let versao = 0
    const carregar = async () => {
      const pedido = ++versao
      try { const lista = await listarGaleriaBolos(); if (ativo && pedido === versao) setFotos(lista) } catch { /* Mantém a última galeria disponível durante falhas de conexão. */ }
    }
    carregar()
    window.addEventListener('focus', carregar)
    return () => { ativo = false; window.removeEventListener('focus', carregar) }
  }, [])
  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const atualizar = (evento) => setReduzir(evento.matches)
    const visibilidade = () => setVisivel(!document.hidden)
    preferencia.addEventListener('change', atualizar)
    document.addEventListener('visibilitychange', visibilidade)
    return () => { preferencia.removeEventListener('change', atualizar); document.removeEventListener('visibilitychange', visibilidade) }
  }, [])
  const indiceAtual = fotos.length ? atual % fotos.length : 0
  const rotacionando = !pausado && !arrastando && !interagindo && !foco && !reduzir && visivel && fotos.length > 1
  useEffect(() => {
    if (!rotacionando) return
    const intervalo = window.setInterval(() => setAtual((indice) => (indice + 1) % fotos.length), 4000)
    return () => window.clearInterval(intervalo)
  }, [rotacionando, fotos.length])
  useEffect(() => {
    const palco = palcoRef.current
    if (!palco || fotos.length < 2) return
    let acumulado = 0
    let ultimo = -Infinity
    let eventoAnterior = -Infinity
    function rolar(event) {
      if (event.ctrlKey) return
      event.preventDefault()
      if (event.timeStamp - ultimo < 450) return
      if (event.timeStamp - eventoAnterior > 180) acumulado = 0
      eventoAnterior = event.timeStamp
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      acumulado += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? palco.clientWidth : 1)
      if (Math.abs(acumulado) < 35) return
      const direcao = Math.sign(acumulado)
      setAtual((indice) => (indice + direcao + fotos.length) % fotos.length)
      acumulado = 0
      ultimo = event.timeStamp
    }
    palco.addEventListener('wheel', rolar, { passive: false })
    return () => palco.removeEventListener('wheel', rolar)
  }, [fotos.length])
  function mover(direcao) { if (fotos.length > 1) setAtual((indice) => (indice + direcao + fotos.length) % fotos.length) }
  function iniciarGesto(event) {
    if (!event.isPrimary || event.button !== 0 || fotos.length < 2) return
    bloquearClique.current = false
    gesto.current = { id: event.pointerId, x: event.clientX, y: event.clientY, ativo: false }
  }
  function arrastar(event) {
    const inicio = gesto.current
    if (!inicio || inicio.id !== event.pointerId) return
    const dx = event.clientX - inicio.x
    const dy = event.clientY - inicio.y
    if (!inicio.ativo && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) { gesto.current = null; return }
    if (Math.abs(dx) < 55) return
    if (!inicio.ativo) {
      inicio.ativo = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setArrastando(true)
      bloquearClique.current = true
    }
    mover(dx < 0 ? 1 : -1)
    inicio.x = event.clientX
    inicio.y = event.clientY
  }
  function terminarGesto(event) {
    if (gesto.current?.id !== event.pointerId) return
    gesto.current = null
    setArrastando(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  if (!fotos.length) return null
  return <section className="carrossel-bolos" aria-label="Galeria de bolos personalizados" aria-roledescription="carrossel" onMouseEnter={() => setInteragindo(true)} onMouseLeave={() => setInteragindo(false)} onFocusCapture={() => setFoco(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFoco(false) }}>
    <div className="carrossel-bolos-titulo"><p className="sobretitulo">FEITOS PARA CELEBRAR</p><h2>Inspire-se nos nossos bolos</h2><p>Detalhes que tornam cada comemoração especial.</p></div>
    <div ref={palcoRef} className="carrossel-bolos-palco" data-arrastando={arrastando} onPointerDown={iniciarGesto} onPointerMove={arrastar} onPointerUp={terminarGesto} onPointerCancel={terminarGesto} onLostPointerCapture={terminarGesto} onPointerLeave={(event) => { if (!gesto.current?.ativo) terminarGesto(event) }} onClickCapture={(event) => { if (bloquearClique.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); bloquearClique.current = false } }}>
      {fotos.map((foto, indice) => {
        const posicao = posicaoFoto(indice, indiceAtual, fotos.length)
        const escondida = Math.abs(posicao) > 3
        return <button key={foto.id} type="button" className="carrossel-bolos-foto" data-posicao={posicao} data-oculta={escondida} tabIndex={posicao === 0 ? 0 : -1} aria-hidden={escondida || undefined} aria-label={`Bolo personalizado, foto ${indice + 1} de ${fotos.length}`} onClick={() => setAtual(indice)}><img src={foto.imagem} alt="Bolo personalizado da galeria" loading="lazy" draggable="false" /></button>
      })}
    </div>
    {fotos.length > 1 && <div className="carrossel-bolos-controles">
      <button type="button" onClick={() => mover(-1)} aria-label="Foto anterior">←</button>
      <span aria-live={rotacionando ? 'off' : 'polite'}>{indiceAtual + 1} / {fotos.length}</span>
      <button type="button" onClick={() => mover(1)} aria-label="Próxima foto">→</button>
      {!reduzir && <button className="carrossel-bolos-pausa" type="button" aria-pressed={pausado} onClick={() => setPausado((valor) => !valor)}>{pausado ? 'Retomar rotação' : 'Pausar rotação'}</button>}
    </div>}
  </section>
}
