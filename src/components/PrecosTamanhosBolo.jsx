import { tamanhosBolos } from '../services/formatosBolos'

export default function PrecosTamanhosBolo({ produto }) {
  return <fieldset className="campo-total cadastro-tamanhos-bolo"><legend>Preços e rendimento por tamanho</legend>{tamanhosBolos.map((tamanho) => <div key={tamanho}>
    <label>Preço {tamanho} (R$)<input name={`preco_${tamanho.toLowerCase()}`} type="number" min="0" step="0.01" required defaultValue={produto[`preco_${tamanho.toLowerCase()}`] ?? (tamanho === 'P' ? produto.preco : '')} /></label>
    <label>Fatias — {tamanho}<input name={`fatias_${tamanho.toLowerCase()}`} maxLength={40} placeholder="Quantidade ou intervalo" defaultValue={produto[`fatias_${tamanho.toLowerCase()}`] || ''} /></label>
  </div>)}</fieldset>
}
