import { precoDoBolo, tamanhosBolos } from '../services/formatosBolos'

export default function SeletorTamanhoBolo({ produto, aoAlterar, detalhado = false }) {
  return <fieldset className="formato-bolo tamanho-bolo"><legend>Tamanho do bolo</legend><div>{tamanhosBolos.map((tamanho) => <button type="button" key={tamanho} disabled={precoDoBolo(produto, tamanho) === null} aria-pressed={produto.tamanho === tamanho} onClick={() => aoAlterar(tamanho)}>{tamanho}</button>)}</div>
    {detalhado && <ul className="fatias-bolo">{tamanhosBolos.map((tamanho) => {
      const fatias = produto[`fatias_${tamanho.toLowerCase()}`]
      const preco = precoDoBolo(produto, tamanho)
      return <li key={tamanho}><b>{tamanho}</b><span>{fatias ? `${fatias} fatias` : 'Rendimento não informado'}</span><strong>{preco === null ? 'Indisponível' : preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
    })}</ul>}
  </fieldset>
}
