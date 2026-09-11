import { useEffect, useRef } from 'react'
import './ModalEncomenda.css'
import './FormularioPersonalizado.css'

export default function ModalEncomenda({ children, aoFechar, cameraAberta }) {
  const fecharRef = useRef(null)
  useEffect(() => {
    const anterior = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    fecharRef.current?.focus()
    return () => { document.body.style.overflow = overflow; anterior?.focus() }
  }, [])

  function teclado(event) {
    if (cameraAberta) return
    if (event.key === 'Escape') { event.stopPropagation(); aoFechar() }
    if (event.key !== 'Tab') return
    const elementos = [...event.currentTarget.querySelectorAll('button, input, select, textarea, a[href]')].filter((el) => !el.disabled && el.getClientRects().length)
    const primeiro = elementos[0]; const ultimo = elementos.at(-1)
    if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo?.focus() }
    if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro?.focus() }
  }

  return <div className="encomenda-modal-fundo" onMouseDown={aoFechar}>
    <section className="encomenda-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-encomenda-modal" onKeyDown={teclado} onMouseDown={(event) => event.stopPropagation()}>
      <div className="encomenda-modal-conteudo">
      <svg className="encomenda-decoracao canto-superior" viewBox="0 0 320 200" width="320" height="200" aria-hidden="true"><path fill="#c3dedf" d="M0 0h320v182c-65 30-131 12-161-41C108 50 27 103 0 0Z"/><path d="M77 0c18 92 95 32 137 115s105 43 106 43" fill="none" stroke="#855746" strokeWidth="1.5"/></svg>
      <svg className="encomenda-decoracao canto-inferior" viewBox="0 0 270 155" width="270" height="155" aria-hidden="true"><path fill="#f5d17d" d="M0 0c61 15 40 62 115 77c47 11 59 51 72 78H0Z"/><path d="M0 67c78-9 63 98 149 68s92 13 121 20" fill="none" stroke="#855746" strokeWidth="1.5"/></svg>
      <header className="encomenda-modal-topo"><div><p className="sobretitulo">DO SEU JEITINHO</p><h2 id="titulo-encomenda-modal">Monte sua encomenda</h2><p>Escolha os detalhes para deixar seu momento ainda mais especial.</p></div><button ref={fecharRef} type="button" onClick={aoFechar} aria-label="Fechar formulário de encomenda">×</button></header>
      {children}
      </div>
    </section>
  </div>
}
