import fachada from '../assets/fachada.jpeg'
import balcao from '../assets/balcao.jpeg'
import salao from '../assets/salao.jpeg'
import './LojaFisica.css'

const ambientes = [
  { imagem: fachada, nome: 'Fachada', alt: 'Fachada da Bolos da Lu com toldo rosa e entrada da doceria' },
  { imagem: balcao, nome: 'Balcão', alt: 'Balcão da doceria com vitrine de bolos e doces' },
  { imagem: salao, nome: 'Salão', alt: 'Salão da doceria com mesas e poltronas cor-de-rosa' },
]

export default function LojaFisica() {
  return <section className="loja-fisica" aria-labelledby="loja-fisica-titulo">
    <div className="loja-fisica-cabecalho">
      <p className="sobretitulo">NOSSO ESPAÇO</p>
      <h2 id="loja-fisica-titulo">Conheça a nossa loja</h2>
    </div>
    <div className="loja-fisica-fotos">
      {ambientes.map(({ imagem, nome, alt }) => <figure key={nome}>
        <img src={imagem} alt={alt} loading="lazy" decoding="async" />
      </figure>)}
    </div>
    <div className="loja-fisica-localizacao">
      <span className="loja-fisica-pin" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
      </span>
      <div className="loja-fisica-endereco">
        <p>VENHA NOS VISITAR</p>
        <address><strong>Rua das Flores, 142 – Centro</strong><span>Monte Alto – SP <i aria-hidden="true">·</i> CEP 15910-000</span></address>
      </div>
      <a className="loja-fisica-mapa" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Rua das Flores, 142 – Centro, Monte Alto - SP, 15910-000')}`} target="_blank" rel="noopener noreferrer" aria-label="Ver endereço no mapa (abre em nova aba)">Ver no mapa <span aria-hidden="true">↗</span></a>
    </div>
  </section>
}
