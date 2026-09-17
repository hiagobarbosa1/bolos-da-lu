import { useEffect, useRef, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'
import './Encomenda.css'
import './Camera.css'
import Admin from './pages/Admin'
import ModalEncomenda from './components/ModalEncomenda'
import CarrosselBolos from './components/CarrosselBolos'
import LojaFisica from './components/LojaFisica'
import Avaliacoes from './components/Avaliacoes'
import bannerBoloPersonalizado from './assets/bannerbolopersonalizado.png'
import Auth from './components/Auth'
import { perfilAtual, sair } from './services/usuariosService'
import './Conta.css'
import { listarProdutos } from './services/produtosService'
import { listarDocesProntaEntrega } from './services/docesProntaEntregaService'
import CarrinhoCompra from './components/CarrinhoCompra'
import './HomeProdutos.css'
import './DestaquesProdutos.css'
import './Categorias.css'
import './ProntaEntrega.css'
import './Carrinho.css'
import './AvisoCarrinho.css'
import './ModalCategoria.css'
import './AvisoConta.css'
import MeusPedidos from './components/MeusPedidos'
import ConfirmacaoWhatsApp from './components/ConfirmacaoWhatsApp'
import AvisoPagamentoPendente from './components/AvisoPagamentoPendente'
import imagemBolos from './assets/bolos.png'
import imagemDocinhos from './assets/docinhos.png'
import imagemCopos from './assets/copo.png'
import imagemKits from './assets/kit.png'
import banner1 from './assets/banner1.png'
import banner2 from './assets/banner2.png'
import banner3 from './assets/banner3.png'
import bannerMobile1 from './assets/bannermobile.png'
import bannerMobile2 from './assets/bannermobile2.png'
import bannerMobile3 from './assets/bannermobile3.png'
import logo from './assets/logo2.png'
import bannerProntaEntrega from './assets/bannerprontaentrega.png'
import fotoLu from './assets/fotolu.png'


const categorias = [
  ['🍰', 'Bolos', 'Sabores que abraçam', 'rosa'],
  ['🧁', 'Doces', 'Pequenas delícias', 'amarelo'],
  ['🎁', 'Kits', 'Para compartilhar', 'verde'],
]

const categoriasCardapio = [
  { nome: 'Bolos', texto: 'Para celebrar momentos especiais', imagem: imagemBolos },
  { nome: 'Docinhos', texto: 'Pequenas delícias para adoçar o dia', imagem: imagemDocinhos },
  { nome: 'Copos e doces', texto: 'Camadas de sabor para aproveitar', imagem: imagemCopos },
  { nome: 'Kits', texto: 'Combinações prontas para presentear', imagem: imagemKits },
]

const banners = [
  { src: banner1, mobileSrc: bannerMobile1, alt: 'Banner 1 da Bolos da Lu' },
  { src: banner2, mobileSrc: bannerMobile2, alt: 'Banner 2 da Bolos da Lu' },
  { src: banner3, mobileSrc: bannerMobile3, alt: 'Banner 3 da Bolos da Lu' },
]

function App() {
  const [paginaAdmin, setPaginaAdmin] = useState(() => window.location.hash === '#admin')
  const [usuario, setUsuario] = useState(undefined)
  const [mostrarAuth, setMostrarAuth] = useState(false)
  const [authCadastro, setAuthCadastro] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos')
  const [docesProntaEntrega, setDocesProntaEntrega] = useState([])
  const [detalheDocePronta, setDetalheDocePronta] = useState(null)
  const [mostrarTodosPronta, setMostrarTodosPronta] = useState(false)
  const [detalheProduto, setDetalheProduto] = useState(null)
  const [avisoCadastroCarrinho, setAvisoCadastroCarrinho] = useState(false)
  const [carrinho, setCarrinho] = useState(() => JSON.parse(localStorage.getItem('bolos-da-lu-carrinho') || '[]'))
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [doceAConfirmar, setDoceAConfirmar] = useState(null)
  const [categoriaAberta, setCategoriaAberta] = useState(null)
  const [pedidoMisto, setPedidoMisto] = useState(false)
  const [avisoConta, setAvisoConta] = useState('')
  const [mostrarMeusPedidos, setMostrarMeusPedidos] = useState(false)
  const [pedidoWhatsApp, setPedidoWhatsApp] = useState(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [menuFlutuanteVisivel, setMenuFlutuanteVisivel] = useState(false)
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const [referencia, setReferencia] = useState(null)
  const [mostrarEncomenda, setMostrarEncomenda] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [cameraAberta, setCameraAberta] = useState(false)
  const [erroCamera, setErroCamera] = useState('')
  const [bannerAtual, setBannerAtual] = useState(0)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const atualizarPagina = () => setPaginaAdmin(window.location.hash === '#admin')
    window.addEventListener('hashchange', atualizarPagina)
    return () => window.removeEventListener('hashchange', atualizarPagina)
  }, [])

  async function carregarPerfil() {
    try { setUsuario(await perfilAtual()) } catch { setUsuario(null) }
  }
  useEffect(() => { carregarPerfil() }, [])
  useEffect(() => { AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 }) }, [])
  useEffect(() => { AOS.refresh() }, [produtos, docesProntaEntrega])
  useEffect(() => {
    const grupos = [
      ['.hero-banners', 'fade-up'],
      ['.cardapio-novo .centralizado', 'fade-up'],
      ['.categoria-foto', 'fade-up'],
      ['.sobre-conteudo', 'fade-right'],
      ['.sobre-imagem', 'zoom-in'],
    ]
    grupos.forEach(([seletor, efeito]) => document.querySelectorAll(seletor).forEach((elemento, indice) => {
      if (!elemento.dataset.aos) elemento.dataset.aos = efeito
      if (indice) elemento.dataset.aosDelay = String(Math.min(indice * 80, 320))
    }))
    AOS.refreshHard()
  }, [produtos, docesProntaEntrega, mostrarTodosPronta])
  useEffect(() => {
    if (paginaAdmin) return
    listarProdutos().then(setProdutos).catch(() => setProdutos([]))
  }, [paginaAdmin])
  useEffect(() => { listarDocesProntaEntrega().then(setDocesProntaEntrega).catch(() => setDocesProntaEntrega([])) }, [])
  useEffect(() => { localStorage.setItem('bolos-da-lu-carrinho', JSON.stringify(carrinho)) }, [carrinho])
  useEffect(() => {
    const acompanharRolagem = () => setMenuFlutuanteVisivel(window.scrollY > 140)
    acompanharRolagem()
    window.addEventListener('scroll', acompanharRolagem, { passive: true })
    return () => window.removeEventListener('scroll', acompanharRolagem)
  }, [])
  useEffect(() => {
    if (!avisoConta) return undefined
    const tempo = window.setTimeout(() => setAvisoConta(''), 3500)
    return () => window.clearTimeout(tempo)
  }, [avisoConta])
  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setBannerAtual((atual) => (atual + 1) % banners.length)
    }, 3500)

    return () => window.clearInterval(intervalo)
  }, [])

  function incluirNoCarrinho(item, tipo, substituirItens = false) { setCarrinho((itens) => { const base = substituirItens ? itens.filter((atual) => atual.tipo === tipo) : itens; const existente = base.find((atual) => atual.id === item.id && atual.tipo === tipo); const limite = tipo === 'pronta_entrega' ? Number(item.quantidade_disponivel) : Infinity; return existente ? base.map((atual) => atual === existente ? { ...atual, quantidade: Math.min(atual.quantidade + 1, limite) } : atual) : limite > 0 ? [...base, { ...item, tipo, quantidade: 1 }] : base }); setCarrinhoAberto(true) }
  function adicionarAoCarrinho(item, tipo) { if (!usuario) { setAvisoCadastroCarrinho(true); return } if (carrinho.some((atual) => atual.tipo !== tipo)) { setDoceAConfirmar({ item, tipo }); return } incluirNoCarrinho(item, tipo) }
  function abrirCarrinho() { if (carrinho.some((item) => item.tipo === 'produto') && carrinho.some((item) => item.tipo === 'pronta_entrega')) { setPedidoMisto(true); return } setCarrinhoAberto(true) }
  function alterarQuantidade(item, mudanca) { setCarrinho((itens) => itens.flatMap((atual) => { if (atual.id !== item.id || atual.tipo !== item.tipo) return [atual]; const quantidade = atual.quantidade + mudanca; const atingiuEstoque = atual.tipo === 'pronta_entrega' && quantidade > Number(atual.quantidade_disponivel); return quantidade > 0 ? [{ ...atual, quantidade: atingiuEstoque ? atual.quantidade : quantidade }] : [] })) }
  function removerDoCarrinho(item) { setCarrinho((itens) => itens.filter((atual) => atual.id !== item.id || atual.tipo !== item.tipo)) }

  function selecionarReferencia(event) {
    const arquivo = event.target.files?.[0]
    if (arquivo) setReferencia({ nome: arquivo.name, url: URL.createObjectURL(arquivo) })
  }

  async function abrirCamera() {
    setErroCamera('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setErroCamera('A câmera não é compatível com este navegador. Envie uma imagem do seu dispositivo.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      streamRef.current = stream
      setCameraAberta(true)
      window.setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 0)
    } catch {
      setErroCamera('Não foi possível acessar a câmera. Você pode permitir o acesso nas configurações ou enviar uma imagem.')
    }
  }

  function fecharCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraAberta(false)
  }

  function confirmarFoto() {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      setReferencia({ nome: 'foto-da-camera.jpg', url: URL.createObjectURL(blob) })
      fecharCamera()
    }, 'image/jpeg', 0.9)
  }

  function enviarPedido(event) {
    event.preventDefault()
    setEnviado(true)
  }

  function mudarBanner(direcao) {
    setBannerAtual((atual) => (atual + direcao + banners.length) % banners.length)
  }

  function abrirDetalhesDoce(evento, doce) {
    const area = evento.currentTarget.getBoundingClientRect()
    const largura = 350
    const cabeNoDireito = area.right + largura + 24 < window.innerWidth
    setDetalheDocePronta({ doce, top: Math.max(18, area.top), left: cabeNoDireito ? area.right + 18 : Math.max(18, area.left - largura - 18) })
  }

  function cardDocePronta(doce, classe = '') {
    return <article className={classe} key={doce.id} data-aos="fade-up" onClick={(evento) => abrirDetalhesDoce(evento, doce)}>{doce.imagem ? <img src={doce.imagem} alt={doce.nome}/> : <div className="doce-sem-imagem">🧁</div>}<button className="favoritar-pronta" onClick={(evento) => evento.stopPropagation()} aria-label={`Favoritar ${doce.nome}`}>♡</button><div><h3>{doce.nome}</h3><strong>R$ {Number(doce.preco).toFixed(2)}</strong><em>● {doce.quantidade_disponivel} disponíveis</em><button className="adicionar-pronta" onClick={(evento) => { evento.stopPropagation(); adicionarAoCarrinho(doce, 'pronta_entrega') }}>🛒 Adicionar</button></div></article>
  }

  function abrirDetalhesProduto(evento, produto) {
    const area = evento.currentTarget.getBoundingClientRect()
    const largura = 350
    const cabeNoDireito = area.right + largura + 24 < window.innerWidth
    setDetalheProduto({ produto, top: Math.max(18, area.top), left: cabeNoDireito ? area.right + 18 : Math.max(18, area.left - largura - 18) })
  }

  async function confirmarLogout() {
    await sair()
    setUsuario(null)
    setMostrarMeusPedidos(false)
    setConfirmarSaida(false)
    setAvisoConta('Você saiu da sua conta. Até logo!')
  }

  if (paginaAdmin && usuario?.papel === 'admin') return <Admin />

  const produtosEmDestaque = [...produtos]
    .filter((produto) => categoriaSelecionada === 'Todos' || produto.categoria === categoriaSelecionada)
    .sort((primeiro, segundo) => Number(Boolean(segundo.imagem)) - Number(Boolean(primeiro.imagem)))
  const produtoPrincipal = produtosEmDestaque[0]
  const produtosSecundarios = produtosEmDestaque.slice(1, 5)

  return <main>
    <header className={`topo ${menuFlutuanteVisivel ? 'menu-flutuante-visivel' : ''}`}>
      <a className="marca" href="#inicio"><img src={logo} alt="Bolos da Lu"/></a>
      <nav className={menuMobileAberto ? 'nav-aberta' : ''}><a href="#cardapio" onClick={() => setMenuMobileAberto(false)}>Cardápio</a><a href="#sobre" onClick={() => setMenuMobileAberto(false)}>Sobre nós</a><a href="#encomenda" onClick={() => setMenuMobileAberto(false)}>Encomendas</a>{usuario && <button className="link-meus-pedidos-mobile" type="button" onClick={() => { setMenuMobileAberto(false); setMostrarMeusPedidos(true) }}>Meus pedidos</button>}</nav>
      <div className="acoes-topo">{usuario ? <div className="conta"><button className="meus-pedidos-topo" onClick={() => setMostrarMeusPedidos(true)}>Meus pedidos</button><span>Olá, {usuario.nome.split(' ')[0]}</span><button onClick={() => setConfirmarSaida(true)}>Sair</button></div> : <button className="botao pequeno" onClick={() => { setAuthCadastro(false); setMostrarAuth(true) }}>Entrar <b>→</b></button>}</div>
      <button className="botao-menu" type="button" onClick={() => setMenuMobileAberto((aberto) => !aberto)} aria-label="Abrir menu de navegação" aria-expanded={menuMobileAberto}><i /><i /><i /></button>
    </header>
    <button className="botao-carrinho" onClick={abrirCarrinho} aria-label="Abrir carrinho"><span className="icone-carrinho">🛒</span><b>{carrinho.reduce((total, item) => total + item.quantidade, 0)}</b></button>

    <section className="hero hero-banners" id="inicio">
      <div className="carrossel-banner" aria-label="Carrossel de banners da loja"><div className="carrossel-track" style={{ transform: `translateX(-${bannerAtual * 100}%)` }}>{banners.map((banner) => <div className="carrossel-slide" key={banner.src}><picture><source media="(max-width: 760px)" srcSet={banner.mobileSrc}/><img src={banner.src} alt={banner.alt}/></picture></div>)}</div><button className="carrossel-controle anterior" type="button" onClick={() => mudarBanner(-1)} aria-label="Banner anterior">‹</button><button className="carrossel-controle proximo" type="button" onClick={() => mudarBanner(1)} aria-label="Próximo banner">›</button><div className="carrossel-dots" aria-label="Indicadores do carrossel">{banners.map((banner, index) => <button key={banner.src} type="button" className={`carrossel-dot ${index === bannerAtual ? 'ativo' : ''}`} onClick={() => setBannerAtual(index)} aria-label={`Ir para o banner ${index + 1}`}/>)}</div></div>
    </section>

    <section className="pronta-entrega pronta-entrega-banner" id="pronta-entrega" style={{ backgroundImage: `url(${bannerProntaEntrega})` }}><div className="conteudo-pronta"><div className="cabecalho-pronta" data-aos="fade-right"><p className="sobretitulo">disponível hoje</p><h2><span>Doces à</span><i>pronta entrega</i></h2><p>Escolha suas delícias e aproveite enquanto ainda temos por aqui. ♥</p></div><div className="grade-pronta">{docesProntaEntrega.slice(0, 4).map((doce) => cardDocePronta(doce))}</div>{docesProntaEntrega.length > 0 && <button className="ver-todos-pronta" data-aos="zoom-in" onClick={() => setMostrarTodosPronta(true)}>Ver todos os produtos <b>→</b></button>}{docesProntaEntrega.length === 0 && <p className="sem-doces-pronta">Nenhum doce à pronta entrega disponível neste momento.</p>}</div></section>


    <section className="secao cardapio-novo" id="cardapio"><div className="centralizado"><p className="sobretitulo">nosso cardápio</p><h2>Qual delícia combina<br />com o seu momento?</h2></div><div className="categorias categorias-imagem">{categoriasCardapio.map(({ nome, texto, imagem }) => { return <button className={`categoria categoria-foto ${categoriaSelecionada === nome ? 'categoria-ativa' : ''}`} onClick={() => setCategoriaAberta(nome)} key={nome} aria-label={`Ver produtos da categoria ${nome}`}><img src={imagem} alt="" /><div><h3>{nome}</h3><small>{texto}</small></div><b>Ver produtos →</b></button> })}</div></section>

    <section className="secao destaques destaques-novo" id="destaques">
      <div className="destaques-cabecalho">
        <div className="destaques-intro" data-aos="fade-right"><p className="sobretitulo">mais vendidos</p><h2>Os queridinhos da loja <span>♡</span></h2><p>Os doces que nossos clientes mais amam, perfeitos para qualquer momento.</p></div>
      </div>
      {produtoPrincipal ? <div className="grade-destaques">
        <article className="destaque-principal" data-aos="fade-up" onClick={(evento) => abrirDetalhesProduto(evento, produtoPrincipal)}>
          <div className="destaque-principal-info"><span className="selo-destaque"><b>#1</b> mais pedido <i>♡</i></span><small>{produtoPrincipal.categoria}</small><h3>{produtoPrincipal.nome}</h3><p>{produtoPrincipal.descricao || 'Feito com ingredientes selecionados e muito carinho.'}</p><strong>R$ {Number(produtoPrincipal.preco).toFixed(2)}</strong><button className="adicionar-destaque" onClick={(evento) => { evento.stopPropagation(); adicionarAoCarrinho(produtoPrincipal, 'produto') }}>🛍 Adicionar</button></div>
          <div className="destaque-principal-imagem">{produtoPrincipal.imagem ? <img src={produtoPrincipal.imagem} alt={produtoPrincipal.nome} /> : <div className="imagem-ausente">🍰</div>}<button className="favorito-destaque" onClick={(evento) => evento.stopPropagation()} aria-label={`Favoritar ${produtoPrincipal.nome}`}>♡</button></div>
        </article>
        <div className="destaques-secundarios">{produtosSecundarios.map((produto) => <article className="destaque-mini" key={produto.id} data-aos="fade-up" onClick={(evento) => abrirDetalhesProduto(evento, produto)}><div className="destaque-mini-imagem">{produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <div className="imagem-ausente">🍰</div>}<button className="favorito-destaque" onClick={(evento) => evento.stopPropagation()} aria-label={`Favoritar ${produto.nome}`}>♡</button></div><div className="destaque-mini-info"><h3>{produto.nome}</h3><strong>R$ {Number(produto.preco).toFixed(2)}</strong><button onClick={(evento) => { evento.stopPropagation(); adicionarAoCarrinho(produto, 'produto') }}>🛍 Adicionar</button></div></article>)}</div>
      </div> : <p className="sem-produtos">Ainda não há produtos cadastrados nesta categoria.</p>}
    </section>

    <section className="banner-encomenda" id="encomenda" aria-label="Bolos personalizados">
      <img src={bannerBoloPersonalizado} alt="Bolos personalizados: seu momento merece um bolo especial. Bolos feitos para transformar cada comemoração em uma lembrança deliciosa." width="1920" height="560" loading="lazy" />
      <button className="botao-banner-encomenda" type="button" aria-label="Personalizar meu bolo" aria-haspopup="dialog" onClick={() => { setEnviado(false); setMostrarEncomenda(true) }} />
    </section>
    <CarrosselBolos />
    {mostrarEncomenda && <ModalEncomenda aoFechar={() => setMostrarEncomenda(false)} cameraAberta={cameraAberta}>
      <form className="formulario" onSubmit={enviarPedido}>
        <div className="linha-form"><label className="campo-encomenda">Produto<select required defaultValue=""><option value="" disabled>Selecione o produto</option><option>Bolo personalizado</option><option>Bolo tradicional</option><option>Kit festa</option><option>Doces</option></select></label><label className="campo-encomenda">Tamanho<select required defaultValue=""><option value="" disabled>Escolha o tamanho</option><option>Pequeno — 10 fatias</option><option>Médio — 20 fatias</option><option>Grande — 35 fatias</option></select></label></div>
        <div className="linha-form tres"><label className="campo-encomenda">Sabor<select required defaultValue=""><option value="" disabled>Escolha</option><option>Chocolate</option><option>Baunilha</option><option>Cenoura</option><option>Red velvet</option></select></label><label className="campo-encomenda">Recheio<select required defaultValue=""><option value="" disabled>Escolha</option><option>Brigadeiro</option><option>Leite ninho</option><option>Morango</option><option>Doce de leite</option></select></label><label className="campo-encomenda">Cobertura<select required defaultValue=""><option value="" disabled>Escolha</option><option>Ganache</option><option>Chantininho</option><option>Buttercream</option><option>Sem cobertura</option></select></label></div>
        <div className="linha-form"><label className="campo-encomenda">Decoração<input required placeholder="Ex.: flores, tema, nome..." /></label><label className="campo-encomenda">Data da entrega<input required type="date" /></label></div>
        <div className="linha-form quantidade"><label className="campo-encomenda">Quantidade<input name="quantidade" required type="number" min="1" step="1" defaultValue="1" /></label><label className="campo-encomenda">Observação<textarea placeholder="Ex.: Quero o bolo com decoração rosa e branca e o nome Maria." rows="2" /></label></div>
        <div className="referencia"><div className="referencia-texto"><b>Foto de referência <small>(opcional)</small></b><span>Envie uma inspiração para nos ajudar a criar seu pedido.</span></div><div className="acoes-imagem"><button className="camera-botao" type="button" onClick={abrirCamera}> Abrir câmera</button><label className="upload"><input type="file" accept="image/*" onChange={selecionarReferencia} /> Enviar imagem</label></div>{erroCamera && <p className="erro-camera">{erroCamera}</p>}{referencia && <div className="preview"><img src={referencia.url} alt="Referência enviada" /><small>{referencia.nome}</small><button type="button" onClick={() => setReferencia(null)}>×</button></div>}</div>
        <button className="botao enviar" type="submit">Enviar encomenda</button>
        {enviado && <p className="sucesso">Prontinho! Recebemos os detalhes da sua encomenda. Em breve, entraremos em contato.</p>}
      </form>
    </ModalEncomenda>}

    <section className="sobre" id="sobre"><div className="sobre-conteudo"><p className="sobretitulo">um toque de carinho</p><h2>Doces feitos para celebrar você.</h2><p>Na Bolos da Lu, cada receita é preparada em pequenas fornadas, com ingredientes selecionados e cuidado em cada detalhe. Criamos bolos, docinhos, copos e kits personalizados para festas, presentes e momentos especiais. Faça sua encomenda e conte para a gente como você imagina essa delícia.</p><div className="sobre-detalhes"><strong>100%</strong><span>feito com carinho<br />em cada receita</span></div></div><div className="sobre-imagem"><i className="forma-amarela"/><i className="forma-rosa"/><img src={fotoLu} alt="Lu, confeiteira da Bolos da Lu, com um bolo"/><span>feito à mão ♥</span></div></section>
    <LojaFisica />
    <Avaliacoes usuario={usuario} aoEntrar={() => { setAuthCadastro(false); setMostrarAuth(true) }} />
    <footer className="rodape-site">© 2026 Bolos da Lu <span>•</span> Feito com muito amor ♥ {usuario?.papel === 'admin' && <><span>•</span><a href="#admin">Área administrativa</a></>}</footer>
    {avisoConta && <div className="aviso-conta-fundo"><div className="aviso-conta" role="status"><span className="icone-aviso-conta">♥</span><div><small>CONTA ACESSADA</small><b>{avisoConta}</b></div><button onClick={() => setAvisoConta('')} aria-label="Fechar aviso">×</button></div></div>}
    {mostrarMeusPedidos && usuario && <MeusPedidos usuario={usuario} aoFechar={() => setMostrarMeusPedidos(false)} />}
    {mostrarAuth && <Auth iniciarCadastro={authCadastro} onClose={() => setMostrarAuth(false)} onAutenticado={async () => { await carregarPerfil(); setMostrarAuth(false); setAvisoConta('Você entrou na sua conta com sucesso! ♥') }} />}
    {avisoCadastroCarrinho && <div className="aviso-mistura aviso-cadastro-carrinho"><div><span>♥</span><h2>Entre ou crie sua conta</h2><p>Para adicionar produtos ao carrinho e acompanhar seu pedido, você precisa estar cadastrado.</p><div><button onClick={() => setAvisoCadastroCarrinho(false)}>Agora não</button><button onClick={() => { setAvisoCadastroCarrinho(false); setAuthCadastro(false); setMostrarAuth(true) }}>Entrar</button><button onClick={() => { setAvisoCadastroCarrinho(false); setAuthCadastro(true); setMostrarAuth(true) }}>Cadastrar</button></div></div></div>}
    {pedidoMisto && <div className="aviso-mistura"><div><span>🛒</span><h2>Escolha um tipo de pedido</h2><p>O carrinho não pode misturar delivery imediato e encomendas. Escolha quais itens deseja manter.</p><div><button onClick={() => { setCarrinho((itens) => itens.filter((item) => item.tipo === 'produto')); setPedidoMisto(false); setCarrinhoAberto(true) }}>Manter encomenda</button><button onClick={() => { setCarrinho((itens) => itens.filter((item) => item.tipo === 'pronta_entrega')); setPedidoMisto(false); setCarrinhoAberto(true) }}>Manter delivery</button></div></div></div>}
    {categoriaAberta && <div className="modal-categoria" onMouseDown={() => setCategoriaAberta(null)}><section onMouseDown={(e) => e.stopPropagation()}><button className="fechar-categoria" onClick={() => setCategoriaAberta(null)}>×</button><p className="sobretitulo">cardápio bolos da lu</p><h2>{categoriaAberta}</h2><p className="descricao-categoria">Escolha sua delícia e adicione ao carrinho.</p><div className="produtos-modal-categoria">{produtos.filter((produto) => produto.categoria === categoriaAberta).map((produto) => <article key={produto.id}><div>{produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <span>🍰</span>}</div><h3>{produto.nome}</h3><p>{produto.descricao}</p><strong>R$ {Number(produto.preco).toFixed(2)}</strong><button onClick={() => adicionarAoCarrinho(produto, 'produto')}>Adicionar ao carrinho +</button></article>)}</div>{produtos.filter((produto) => produto.categoria === categoriaAberta).length === 0 && <p className="modal-vazio">Ainda não há produtos cadastrados nesta categoria.</p>}</section></div>}
    {doceAConfirmar && <div className="aviso-mistura"><div><span>{doceAConfirmar.tipo === 'pronta_entrega' ? '⚡' : '🎂'}</span><h2>Pedido separado</h2><p>{doceAConfirmar.tipo === 'pronta_entrega' ? 'Produtos de pronta entrega são enviados como delivery. Para adicioná-los, os itens de encomenda serão removidos do carrinho.' : 'Produtos por encomenda têm data de produção. Para adicioná-los, os itens de delivery serão removidos do carrinho.'}</p><div><button onClick={() => setDoceAConfirmar(null)}>Manter pedido atual</button><button onClick={() => { incluirNoCarrinho(doceAConfirmar.item, doceAConfirmar.tipo, true); setDoceAConfirmar(null) }}>{doceAConfirmar.tipo === 'pronta_entrega' ? 'Continuar com delivery' : 'Continuar com encomenda'}</button></div></div></div>}
    <CarrinhoCompra itens={carrinho} aberto={carrinhoAberto} aoFechar={() => setCarrinhoAberto(false)} aoAlterarQuantidade={alterarQuantidade} aoRemover={removerDoCarrinho} aoFinalizar={(dados) => { setCarrinho([]); setCarrinhoAberto(false); setPedidoWhatsApp(dados); if (dados.itens.every((item) => item.tipo === 'pronta_entrega')) listarDocesProntaEntrega().then(setDocesProntaEntrega) }} aoEntrar={() => { setAuthCadastro(false); setMostrarAuth(true) }} />
    {usuario?.id && <AvisoPagamentoPendente key={usuario.id} usuarioId={usuario.id} pedidoRecenteId={pedidoWhatsApp?.pedido.id} oculto={Boolean(pedidoWhatsApp) || carrinhoAberto} />}
    {pedidoWhatsApp && <ConfirmacaoWhatsApp dados={pedidoWhatsApp} aoFechar={() => setPedidoWhatsApp(null)} />}
    {mostrarTodosPronta && <div className="modal-todos-pronta" onMouseDown={() => setMostrarTodosPronta(false)}><section onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-todos-pronta" onClick={() => setMostrarTodosPronta(false)} aria-label="Fechar todos os doces">×</button><p className="sobretitulo">DISPONÍVEL HOJE</p><h2>Todos os doces<br /><i>à pronta entrega</i></h2><p>Escolha suas delícias e receba ou retire ainda hoje.</p><div className="grade-todos-pronta">{docesProntaEntrega.map((doce) => cardDocePronta(doce, 'todos-pronta-card'))}</div></section></div>}
    {detalheDocePronta && <div className="fundo-detalhe-pronta" onMouseDown={() => setDetalheDocePronta(null)}><aside className="detalhe-pronta" style={{ top: detalheDocePronta.top, left: detalheDocePronta.left }} onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-detalhe-pronta" onClick={() => setDetalheDocePronta(null)}>×</button>{detalheDocePronta.doce.imagem && <img src={detalheDocePronta.doce.imagem} alt={detalheDocePronta.doce.nome}/>}<p className="sobretitulo">PRONTA ENTREGA</p><h2>{detalheDocePronta.doce.nome}</h2><p>{detalheDocePronta.doce.descricao || 'Uma delícia preparada com carinho para adoçar o seu dia.'}</p><span className="estoque-detalhe-pronta">● {detalheDocePronta.doce.quantidade_disponivel} disponíveis</span></aside></div>}
    {detalheProduto && <div className="fundo-detalhe-pronta" onMouseDown={() => setDetalheProduto(null)}><aside className="detalhe-pronta detalhe-produto" style={{ top: detalheProduto.top, left: detalheProduto.left }} onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-detalhe-pronta" onClick={() => setDetalheProduto(null)}>×</button>{detalheProduto.produto.imagem && <img src={detalheProduto.produto.imagem} alt={detalheProduto.produto.nome}/>}<p className="sobretitulo">{detalheProduto.produto.categoria}</p><h2>{detalheProduto.produto.nome}</h2><p>{detalheProduto.produto.descricao || 'Uma delícia feita com ingredientes selecionados e muito carinho.'}</p></aside></div>}
    {confirmarSaida && <div className="aviso-conta-fundo"><section className="confirmar-saida" role="dialog" aria-modal="true" aria-label="Confirmar saída"><span>♥</span><p className="sobretitulo">ATÉ LOGO</p><h2>Deseja sair da conta?</h2><p>Você poderá entrar novamente quando quiser para acompanhar seus pedidos.</p><div><button onClick={() => setConfirmarSaida(false)}>Cancelar</button><button className="confirmar" onClick={confirmarLogout}>Sim, sair</button></div></section></div>}
    {cameraAberta && <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Câmera para foto de referência"><div className="camera-caixa"><div className="camera-cabecalho"><div><b>Foto de referência</b><small>Posicione a inspiração dentro do quadro.</small></div><button type="button" onClick={fecharCamera} aria-label="Fechar câmera">×</button></div><div className="camera-video"><video ref={videoRef} autoPlay playsInline muted /></div><div className="camera-acoes"><button type="button" className="camera-cancelar" onClick={fecharCamera}>Cancelar</button><button type="button" className="botao" onClick={confirmarFoto}>Confirmar foto <b>→</b></button></div></div></div>}
  </main>
}
export default App
