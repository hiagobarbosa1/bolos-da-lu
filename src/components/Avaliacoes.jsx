import { useEffect, useRef, useState } from 'react'
import { listarAvaliacoes, listarProdutosParaAvaliar, publicarAvaliacao, validarFotoAvaliacao } from '../services/avaliacoesService'
import './Avaliacoes.css'

function Formulario({ usuario, aoPublicado }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [previa, setPrevia] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const trava = useRef(false)
  const [produtos, setProdutos] = useState([])
  const [itemPedidoId, setItemPedidoId] = useState('')
  const [consultando, setConsultando] = useState(true)
  const [erroConsulta, setErroConsulta] = useState('')
  const [tentativa, setTentativa] = useState(0)
  useEffect(() => {
    let ativo = true
    listarProdutosParaAvaliar().then((itens) => {
      if (ativo) setProdutos(itens)
    }).catch((error) => { if (ativo) setErroConsulta(error.message) })
      .finally(() => { if (ativo) setConsultando(false) })
    return () => { ativo = false }
  }, [tentativa])
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
    try { await publicarAvaliacao({ itemPedidoId, nota, comentario, arquivo }); aoPublicado() }
    catch (error) { setErro(error.message) }
    finally { trava.current = false; setEnviando(false) }
  }
  if (consultando) return <p role="status">Consultando seus produtos recebidosâ€¦</p>
  if (erroConsulta) return <div className="avaliacao-erro" role="alert">{erroConsulta} <button type="button" onClick={() => { setErroConsulta(''); setConsultando(true); setTentativa((valor) => valor + 1) }}>Tentar novamente</button></div>
  if (!produtos.length) return <p className="avaliacao-login">VocÃª poderÃ¡ avaliar os produtos quando a loja marcar seu pedido como entregue. Se jÃ¡ avaliou todos os produtos recebidos, aguarde seu prÃ³ximo pedido.</p>
  return <form className="avaliacao-formulario" onSubmit={enviar}>
    <p>Conte sua experiÃªncia, <strong>{usuario.nome}</strong>.</p>
    <label className="avaliacao-produto">Qual produto vocÃª recebeu?
      <select required value={itemPedidoId} disabled={enviando} onChange={(event) => setItemPedidoId(event.target.value)}>
        <option value="" disabled>Selecione o produto</option>
        {produtos.map((item) => <option key={item.item_pedido_id} value={item.item_pedido_id}>{item.nome_produto} Â· Pedido #{item.pedido_id}</option>)}
      </select>
    </label>
    <fieldset disabled={enviando} className="avaliacao-estrelas-campo">
      <legend>Quantas estrelas esse produto merece?</legend>
      <div className="avaliacao-escolha-estrelas">{[1, 2, 3, 4, 5].map((valor) => <label key={valor}>
        <input type="radio" name="nota" value={valor} checked={nota === valor} onChange={() => setNota(valor)} required aria-label={`${valor} ${valor === 1 ? 'estrela' : 'estrelas'}`} />
        <span aria-hidden="true" className={valor <= nota ? 'preenchida' : ''}>â˜…</span>
      </label>)}</div>
    </fieldset>
    <label className="avaliacao-comentario">O que vocÃª achou?
      <textarea value={comentario} onChange={(event) => setComentario(event.target.value)} required minLength={3} maxLength={1000} rows={4} disabled={enviando} placeholder="Conte como foi receber e saborear seu pedidoâ€¦" />
    </label>
    <div className="avaliacao-foto-campo">
      <label>Foto do seu pedido <span>(opcional)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherFoto} disabled={enviando} /></label>
      <small>JPG, PNG ou WebP, atÃ© 5 MB. Seu nome, comentÃ¡rio e foto ficarÃ£o pÃºblicos.</small>
      {previa && <div className="avaliacao-previa"><img src={previa} alt="PrÃ©via da foto do seu pedido" /><button type="button" disabled={enviando} onClick={() => { setArquivo(null); setPrevia('') }}>Remover foto</button></div>}
    </div>
    {erro && <p className="avaliacao-erro" role="alert">{erro}</p>}
    <button className="avaliacoes-botao" disabled={enviando} type="submit">{enviando ? 'Publicandoâ€¦' : 'Publicar avaliaÃ§Ã£o'}</button>
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
  const [modoMobile, setModoMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  useEffect(() => {
    const consulta = window.matchMedia('(max-width: 760px)')
    const atualizar = () => setModoMobile(consulta.matches)
    atualizar()
    consulta.addEventListener('change', atualizar)
    return () => consulta.removeEventListener('change', atualizar)
  }, [])
  useEffect(() => {
    let ativo = true
    listarAvaliacoes(pagina).then((resultado) => {
      if (!ativo) return
      setItens((anteriores) => pagina === 0 ? resultado.itens : [...anteriores, ...resultado.itens.filter((item) => !anteriores.some((anterior) => anterior.id === item.id))])
      setMais(resultado.mais)
    }).catch(() => { if (ativo) setErro('NÃ£o conseguimos carregar as avaliaÃ§Ãµes agora.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [pagina, versao])
  function recarregar() { setErro(''); setCarregando(true); setVersao((valor) => valor + 1) }
  const media = itens.length ? (itens.reduce((total, item) => total + Number(item.nota), 0) / itens.length).toFixed(1) : '5.0'
  const itensPorPagina = modoMobile ? 1 : 3
  const totalPaginas = Math.max(1, Math.ceil(itens.length / itensPorPagina))
  useEffect(() => { setSlide((atual) => Math.min(atual, totalPaginas - 1)) }, [totalPaginas])
  useEffect(() => {
    if (!modoMobile || itens.length < 2) return undefined
    const intervalo = window.setInterval(() => setSlide((atual) => (atual + 1) % totalPaginas), 4500)
    return () => window.clearInterval(intervalo)
  }, [modoMobile, itens.length, totalPaginas])
  const itensDoSlide = modoMobile ? itens : itens.slice(slide * itensPorPagina, (slide + 1) * itensPorPagina)
  return <section className="avaliacoes" aria-labelledby="avaliacoes-titulo">
    <div className="avaliacoes-decoracao" aria-hidden="true"><i className="avaliacoes-mancha rosa" /></div>
    <div className="avaliacoes-conteudo">
      <div className="avaliacoes-cabecalho">
        <div><p className="sobretitulo">COMENTÃRIOS</p><h2 id="avaliacoes-titulo">Quem prova, se apaixona <em>pelos nossos doces</em></h2><div className="avaliacoes-resumo"><strong><span aria-hidden="true">â˜…</span> {media}</strong></div></div>

      </div>
      <div className="avaliacoes-publicar"><button className="avaliacoes-botao" type="button" aria-expanded={aberto} aria-controls="avaliacao-escrever" onClick={() => setAberto((valor) => !valor)}>{aberto ? 'Fechar formulÃ¡rio' : 'Escrever minha avaliaÃ§Ã£o'}</button></div>
      {sucesso && <p className="avaliacao-sucesso" role="status"><span aria-hidden="true">âœ“</span><strong>Obrigada pelo carinho!</strong><small>Sua avaliaÃ§Ã£o foi publicada.</small><button type="button" onClick={() => setSucesso(false)} aria-label="Fechar aviso">Ã—</button></p>}
      <div id="avaliacao-escrever" hidden={!aberto}>
        {aberto && (usuario ? <Formulario key={usuario.id} usuario={usuario} aoPublicado={() => { setAberto(false); setSucesso(true); setPagina(0); recarregar() }} /> : <div className="avaliacao-login"><p>Entre na sua conta para compartilhar sua experiÃªncia e a foto do seu pedido.</p><button className="avaliacoes-botao" onClick={aoEntrar} type="button">Entrar para avaliar</button></div>)}
      </div>
      <div className="avaliacoes-carrossel-wrap">{itens.length > itensPorPagina && <button className="avaliacoes-seta" type="button" aria-label="AvaliaÃ§Ãµes anteriores" onClick={() => setSlide((valor) => (valor - 1 + totalPaginas) % totalPaginas)}>â†</button>}<div className={modoMobile ? 'avaliacoes-viewport' : ''}><div className="avaliacoes-grade" style={modoMobile ? { transform: `translateX(-${slide * 100}%)` } : undefined}>{itensDoSlide.map((item) => <article className="avaliacao-card" key={item.id}>
        <div className="avaliacao-card-topo"><div className="avaliacao-identidade"><span className="avaliacao-inicial" aria-hidden="true">{item.nome.trim().charAt(0).toUpperCase()}</span><div><strong>{item.nome}</strong><span className="avaliacao-estrelas" aria-label={`${item.nota} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((valor) => <span key={valor} aria-hidden="true" className={valor <= item.nota ? 'preenchida' : ''}>â˜…</span>)}</span></div></div><span className="avaliacao-aspas" aria-hidden="true">â€</span></div>
        <p className="avaliacao-texto">{item.comentario}</p>
        {item.imagem && <a className="avaliacao-foto" href={item.imagem} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar foto do pedido de ${item.nome} (nova aba)`}><img src={item.imagem} alt={`Foto do pedido compartilhada por ${item.nome}`} loading="lazy" /></a>}
        <div className="avaliacao-card-rodape"><time dateTime={item.criado_em}>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</time></div>
      </article>)}</div></div>{itens.length > itensPorPagina && <button className="avaliacoes-seta" type="button" aria-label="PrÃ³ximas avaliaÃ§Ãµes" onClick={() => setSlide((valor) => (valor + 1) % totalPaginas)}>â†’</button>}</div>
      {itens.length > itensPorPagina && <div className="avaliacoes-indicadores">{Array.from({ length: totalPaginas }, (_, indice) => <button type="button" key={indice} aria-label={`PÃ¡gina ${indice + 1} de avaliaÃ§Ãµes`} aria-current={slide === indice ? 'page' : undefined} onClick={() => setSlide(indice)} />)}</div>}
      {carregando && <p role="status">Carregando avaliaÃ§Ãµesâ€¦</p>}
      {erro && <div className="avaliacao-erro" role="alert">{erro} <button type="button" onClick={recarregar} disabled={carregando}>Tentar novamente</button></div>}
      {!carregando && !erro && !itens.length && <p className="avaliacoes-vazio">Cada pedido tem uma histÃ³ria. Seja a primeira pessoa a contar a sua!</p>}
      {mais && !erro && <button className="avaliacoes-mais" type="button" disabled={carregando} onClick={() => { setCarregando(true); setPagina((valor) => valor + 1) }}>Ver mais avaliaÃ§Ãµes</button>}
    </div>
  </section>
}
