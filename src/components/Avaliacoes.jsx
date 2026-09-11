import { useEffect, useRef, useState } from 'react'
import { listarAvaliacoes, publicarAvaliacao, validarFotoAvaliacao } from '../services/avaliacoesService'
import './Avaliacoes.css'

function Formulario({ usuario, aoPublicado }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [previa, setPrevia] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const trava = useRef(false)
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])
  function escolherFoto(event) {
    const foto = event.target.files?.[0]
    event.target.value = ''
    if (!foto) return
    try {
      validarFotoAvaliacao(foto)
      setArquivo(foto); setPrevia(URL.createObjectURL(foto)); setErro('')
    } catch (error) { setErro(error.message) }
  }
  async function enviar(event) {
    event.preventDefault()
    if (trava.current) return
    trava.current = true; setEnviando(true); setErro('')
    try { await publicarAvaliacao({ nota, comentario, arquivo }); aoPublicado() }
    catch (error) { setErro(error.message) }
    finally { trava.current = false; setEnviando(false) }
  }
  return <form className="avaliacao-formulario" onSubmit={enviar}>
    <p>Conte sua experiência, <strong>{usuario.nome}</strong>.</p>
    <fieldset disabled={enviando} className="avaliacao-estrelas-campo">
      <legend>Quantas estrelas seu pedido merece?</legend>
      <div className="avaliacao-escolha-estrelas">{[1, 2, 3, 4, 5].map((valor) => <label key={valor}>
        <input type="radio" name="nota" value={valor} checked={nota === valor} onChange={() => setNota(valor)} required aria-label={`${valor} ${valor === 1 ? 'estrela' : 'estrelas'}`} />
        <span aria-hidden="true" className={valor <= nota ? 'preenchida' : ''}>★</span>
      </label>)}</div>
    </fieldset>
    <label className="avaliacao-comentario">O que você achou?
      <textarea value={comentario} onChange={(event) => setComentario(event.target.value)} required minLength={3} maxLength={1000} rows={4} disabled={enviando} placeholder="Conte como foi receber e saborear seu pedido…" />
    </label>
    <div className="avaliacao-foto-campo">
      <label>Foto do seu pedido <span>(opcional)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherFoto} disabled={enviando} /></label>
      <small>JPG, PNG ou WebP, até 5 MB. Seu nome, comentário e foto ficarão públicos.</small>
      {previa && <div className="avaliacao-previa"><img src={previa} alt="Prévia da foto do seu pedido" /><button type="button" disabled={enviando} onClick={() => { setArquivo(null); setPrevia('') }}>Remover foto</button></div>}
    </div>
    {erro && <p className="avaliacao-erro" role="alert">{erro}</p>}
    <button className="avaliacoes-botao" disabled={enviando} type="submit">{enviando ? 'Publicando…' : 'Publicar avaliação'}</button>
  </form>
}

export default function Avaliacoes({ usuario, aoEntrar }) {
  const [itens, setItens] = useState([])
  const [pagina, setPagina] = useState(0)
  const [mais, setMais] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [versao, setVersao] = useState(0)
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    let ativo = true
    listarAvaliacoes(pagina).then((resultado) => {
      if (!ativo) return
      setItens((anteriores) => pagina === 0 ? resultado.itens : [...anteriores, ...resultado.itens.filter((item) => !anteriores.some((anterior) => anterior.id === item.id))])
      setMais(resultado.mais)
    }).catch(() => { if (ativo) setErro('Não conseguimos carregar as avaliações agora.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [pagina, versao])
  function recarregar() { setErro(''); setCarregando(true); setVersao((valor) => valor + 1) }
  const media = itens.length ? (itens.reduce((total, item) => total + Number(item.nota), 0) / itens.length).toFixed(1) : '5.0'
  return <section className="avaliacoes" aria-labelledby="avaliacoes-titulo">
    <div className="avaliacoes-decoracao" aria-hidden="true"><i className="avaliacoes-mancha rosa" /><svg viewBox="0 0 200 150" fill="none"><path d="M30 80C-5 35 30 25 42 57C50 10 90 23 60 70L43 95Z" /><path d="M100 110q25-50 40-35t-40 35m-3-10q-20-50-32-30t32 30m12 27 50-2" /></svg></div>
    <div className="avaliacoes-conteudo">
      <div className="avaliacoes-cabecalho">
        <div><p className="sobretitulo">COMENTÁRIOS</p><h2 id="avaliacoes-titulo">Quem prova, se apaixona <em>pelos nossos doces</em></h2><div className="avaliacoes-resumo"><strong><span aria-hidden="true">★</span> {media}</strong><i /><div><b>de {itens.length} avaliações</b><small>Clientes que já viveram essa doce experiência</small></div></div></div>

      </div>
      <div className="avaliacoes-publicar"><button className="avaliacoes-botao" type="button" aria-expanded={aberto} aria-controls="avaliacao-escrever" onClick={() => setAberto((valor) => !valor)}>{aberto ? 'Fechar formulário' : 'Escrever minha avaliação'}</button></div>
      {sucesso && <p className="avaliacao-sucesso" role="status"><span aria-hidden="true">✓</span><strong>Obrigada pelo carinho!</strong><small>Sua avaliação foi publicada.</small><button type="button" onClick={() => setSucesso(false)} aria-label="Fechar aviso">×</button></p>}
      <div id="avaliacao-escrever" hidden={!aberto}>
        {aberto && (usuario ? <Formulario key={usuario.id} usuario={usuario} aoPublicado={() => { setAberto(false); setSucesso(true); setPagina(0); recarregar() }} /> : <div className="avaliacao-login"><p>Entre na sua conta para compartilhar sua experiência e a foto do seu pedido.</p><button className="avaliacoes-botao" onClick={aoEntrar} type="button">Entrar para avaliar</button></div>)}
      </div>
      <div className="avaliacoes-carrossel-wrap">{itens.length > 3 && <button className="avaliacoes-seta" type="button" aria-label="Avaliações anteriores" onClick={() => setSlide((valor) => Math.max(0, valor - 3))} disabled={slide === 0}>←</button>}<div className="avaliacoes-grade">{itens.slice(slide, slide + 3).map((item) => <article className="avaliacao-card" key={item.id}>
        <div className="avaliacao-card-topo"><div className="avaliacao-identidade"><span className="avaliacao-inicial" aria-hidden="true">{item.nome.trim().charAt(0).toUpperCase()}</span><div><strong>{item.nome}</strong><span className="avaliacao-estrelas" aria-label={`${item.nota} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((valor) => <span key={valor} aria-hidden="true" className={valor <= item.nota ? 'preenchida' : ''}>★</span>)}</span></div></div><span className="avaliacao-aspas" aria-hidden="true">”</span></div>
        <p className="avaliacao-texto">{item.comentario}</p>
        {item.imagem && <a className="avaliacao-foto" href={item.imagem} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar foto do pedido de ${item.nome} (nova aba)`}><img src={item.imagem} alt={`Foto do pedido compartilhada por ${item.nome}`} loading="lazy" /></a>}
        <div className="avaliacao-card-rodape"><time dateTime={item.criado_em}>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</time></div>
      </article>)}</div>{itens.length > 3 && <button className="avaliacoes-seta" type="button" aria-label="Próximas avaliações" onClick={() => setSlide((valor) => Math.min(Math.max(0, itens.length - 3), valor + 3))} disabled={slide + 3 >= itens.length}>→</button>}</div>
      {itens.length > 3 && <div className="avaliacoes-indicadores">{Array.from({ length: Math.ceil(itens.length / 3) }, (_, indice) => <button type="button" key={indice} aria-label={`Página ${indice + 1} de avaliações`} aria-current={Math.floor(slide / 3) === indice ? 'page' : undefined} onClick={() => setSlide(indice * 3)} />)}</div>}
      {carregando && <p role="status">Carregando avaliações…</p>}
      {erro && <div className="avaliacao-erro" role="alert">{erro} <button type="button" onClick={recarregar} disabled={carregando}>Tentar novamente</button></div>}
      {!carregando && !erro && !itens.length && <p className="avaliacoes-vazio">Cada pedido tem uma história. Seja a primeira pessoa a contar a sua!</p>}
      {mais && !erro && <button className="avaliacoes-mais" type="button" disabled={carregando} onClick={() => { setCarregando(true); setPagina((valor) => valor + 1) }}>Ver mais avaliações</button>}
    </div>
  </section>
}
