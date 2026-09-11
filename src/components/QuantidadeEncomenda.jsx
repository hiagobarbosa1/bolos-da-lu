import { useState } from 'react'

export default function QuantidadeEncomenda() {
  const [quantidade, setQuantidade] = useState(1)
  return <div className="campo-quantidade-encomenda"><label htmlFor="quantidade-encomenda">Quantidade</label><div className="controle-quantidade-encomenda">
    <button type="button" aria-label="Diminuir quantidade" disabled={Number(quantidade) <= 1} onClick={() => setQuantidade(Math.max(1, Number(quantidade) - 1))}>−</button>
    <input id="quantidade-encomenda" name="quantidade" required type="number" min="1" step="1" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
    <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantidade(Math.max(1, Number(quantidade) + 1))}>+</button>
  </div></div>
}
