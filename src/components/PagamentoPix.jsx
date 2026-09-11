import { useState } from 'react'
import './PagamentoPix.css'

const chavePix = '16993087352'

export default function PagamentoPix({ total, pedidoRegistrado = false }) {
  const [mensagem, setMensagem] = useState('')

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(chavePix)
      setMensagem('Chave Pix copiada! Cole no aplicativo do seu banco.')
    } catch {
      setMensagem('Não foi possível copiar. Selecione a chave acima e copie manualmente.')
    }
  }

  return <div className="pagamento-pix" aria-label="Pagamento por Pix">
    <div className="pix-valor"><span>Total a pagar via Pix</span><strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
    <div className="pix-recebedora"><span className="pix-simbolo" aria-hidden="true">◇</span><div><b>Luciana Aparecida Benedito</b><small>Nubank · Recebedora</small></div></div>
    <label>Chave Pix<input aria-label="Chave Pix" readOnly value={chavePix} onFocus={(event) => event.target.select()} /></label>
    <button type="button" onClick={copiarChave}>Copiar chave Pix</button>
    <p>{pedidoRegistrado ? 'Cole a chave no app do seu banco. Após o Pix, aguarde a confirmação da doceria.' : 'Registre seu pedido antes de fazer o Pix.'}</p>
    <p role="status" aria-live="polite">{mensagem}</p>
  </div>
}
