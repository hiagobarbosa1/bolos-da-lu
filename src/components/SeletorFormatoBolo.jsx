import { formatosBolos } from '../services/formatosBolos'

export default function SeletorFormatoBolo({ valor, aoAlterar }) {
  return <fieldset className="formato-bolo"><legend>Formato do bolo</legend><div>{formatosBolos.map((formato) => <button type="button" key={formato} aria-pressed={valor === formato} onClick={() => aoAlterar(formato)}>{formato}</button>)}</div></fieldset>
}
