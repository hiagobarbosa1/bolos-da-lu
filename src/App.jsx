import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'
import './Encomenda.css'
import Admin from './pages/Admin'
import ModalEncomenda from './components/ModalEncomenda'
import CarrosselBolos from './components/CarrosselBolos'
import LojaFisica from './components/LojaFisica'
import Avaliacoes from './components/Avaliacoes'
import bannerBoloPersonalizado from './assets/bannerbolopersonalizado.png'
import bannerBoloPersonalizadoMobile from './assets/bannermobilepersonalizado.png'
import Auth from './components/Auth'
import { perfilAtual, sair } from './services/usuariosService'
import './Conta.css'
import { listarProdutos } from './services/produtosService'
import { listarDocesProntaEntrega } from './services/docesProntaEntregaService'
import { listarGaleriaBolos } from './services/galeriaBolosService'
import CarrinhoCompra from './components/CarrinhoCompra'
import './HomeProdutos.css'
import './DestaquesProdutos.css'
import './Categorias.css'
import './ProntaEntrega.css'
import './Carrinho.css'
import './AvisoCarrinho.css'
import './ModalCategoria.css'
import ProdutosCategoria from './components/ProdutosCategoria'
import { prepararDocinho, tipoDocinho, quantidadesDocinhos } from './services/tiposDocinhos'
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

const precosBolosPersonalizados = {
  'Prestígio': { P: 90, M: 170, G: 220 },
  'Bombom de morango': { P: 100, M: 180, G: 230 },
  'Doce de leite com gotas': { P: 90, M: 160, G: 210 },
  'Maracujá trufado': { P: 100, M: 180, G: 230 },
  Choconinho: { P: 90, M: 170, G: 220 },
  'Dois amores': { P: 100, M: 180, G: 230 },
  'Dois amores com bombom': { P: 110, M: 200, G: 250 },
  'Leite Ninho': { P: 90, M: 170, G: 230 },
  'Leite Ninho com morango': { P: 100, M: 180, G: 230 },
  'Leite Ninho com abacaxi': { P: 100, M: 180, G: 230 },
  'Leite Ninho com Nutella': { P: 110, M: 200, G: 250 },
  'Doce de leite': { P: 80, M: 150, G: 200 },
  'Doce de leite com morango': { P: 90, M: 160, G: 210 },
  'Doce de leite com nozes': { P: 100, M: 170, G: 220 },
  'Doce de leite com ameixa': { P: 90, M: 160, G: 210 },
  'Torta de abacaxi': { P: 80, M: 150, G: 200 },
}

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
  const [avisoEncomendaComPronta, setAvisoEncomendaComPronta] = useState(false)
  const [categoriaAberta, setCategoriaAberta] = useState(null)
  const [produtoQuantidadePendente, setProdutoQuantidadePendente] = useState(null)
  const [pedidoMisto, setPedidoMisto] = useState(false)
  const [avisoConta, setAvisoConta] = useState('')
  const [mostrarMeusPedidos, setMostrarMeusPedidos] = useState(false)
  const [pedidoWhatsApp, setPedidoWhatsApp] = useState(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [menuFlutuanteVisivel, setMenuFlutuanteVisivel] = useState(false)
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const [referencia, setReferencia] = useState(null)
  const [galeriaReferenciaAberta, setGaleriaReferenciaAberta] = useState(false)
  const [fotosReferencia, setFotosReferencia] = useState([])
  const [carregandoFotosReferencia, setCarregandoFotosReferencia] = useState(false)
  const [erroFotosReferencia, setErroFotosReferencia] = useState('')
  const [mostrarEncomenda, setMostrarEncomenda] = useState(false)
  const [bannerAtual, setBannerAtual] = useState(0)

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

  function incluirNoCarrinho(item, tipo, substituirItens = false) { setCarrinho((itens) => { const base = substituirItens ? itens.filter((atual) => atual.tipo === tipo) : itens; const existente = base.find((atual) => atual.id === item.id && atual.tipo === tipo); const limite = tipo === 'pronta_entrega' ? Number(item.quantidade_disponivel) : Infinity; const quantidade = Math.max(1, Number(item.quantidade) || 1); return existente ? base.map((atual) => atual === existente ? { ...atual, ...item, quantidade: item.vendaDocinhos ? quantidade : Math.min(atual.quantidade + quantidade, limite) } : atual) : limite > 0 ? [...base, { ...item, tipo, quantidade }] : base }); setCarrinhoAberto(true) }
  function adicionarAoCarrinho(item, tipo) { if (tipo === 'produto' && (item.vendaDocinhos || tipoDocinho(item)) && !quantidadesDocinhos.includes(Number(item.quantidade))) { setProdutoQuantidadePendente(item.id); setCategoriaAberta(item.categoria); return } setProdutoQuantidadePendente(null); if (tipo === 'produto') item = prepararDocinho(item); if (!usuario) { setAvisoCadastroCarrinho(true); return } if (carrinho.some((atual) => atual.tipo !== tipo)) { setDoceAConfirmar({ item, tipo }); return } incluirNoCarrinho(item, tipo) }
  function abrirCarrinho() { if (carrinho.some((item) => item.tipo === 'produto') && carrinho.some((item) => item.tipo === 'pronta_entrega')) { setPedidoMisto(true); return } setCarrinhoAberto(true) }
  function alterarQuantidade(item, mudanca) { setCarrinho((itens) => itens.flatMap((atual) => { if (atual.id !== item.id || atual.tipo !== item.tipo) return [atual]; const quantidade = atual.quantidade + mudanca; const atingiuEstoque = atual.tipo === 'pronta_entrega' && quantidade > Number(atual.quantidade_disponivel); return quantidade > 0 ? [{ ...atual, quantidade: atingiuEstoque ? atual.quantidade : quantidade }] : [] })) }
  function removerDoCarrinho(item) { setCarrinho((itens) => itens.filter((atual) => atual.id !== item.id || atual.tipo !== item.tipo)) }

  function selecionarReferencia(event) {
    const arquivo = event.target.files?.[0]
    if (arquivo) setReferencia({ nome: arquivo.name, url: URL.createObjectURL(arquivo) })
  }

  async function abrirGaleriaReferencia() {
    setGaleriaReferenciaAberta(true)
    setCarregandoFotosReferencia(true)
    setErroFotosReferencia('')
    try { setFotosReferencia(await listarGaleriaBolos()) }
    catch { setErroFotosReferencia('Não foi possível carregar a galeria agora.') }
    finally { setCarregandoFotosReferencia(false) }
  }

  function selecionarFotoGaleria(foto) {
    setReferencia({ nome: 'Foto selecionada da galeria', url: foto.imagem })
    setGaleriaReferenciaAberta(false)
  }

  function enviarPedido(event) {
    event.preventDefault()
    if (!usuario) { setAvisoCadastroCarrinho(true); return }
    const dados = Object.fromEntries(new FormData(event.currentTarget))
    const preco = precosBolosPersonalizados[dados.sabor]?.[dados.tamanho]
    if (!preco) return
    const detalhes = [`Sabor: ${dados.sabor}`, `Tamanho: ${dados.tamanho}`, dados.decoracao && `Decoração: ${dados.decoracao}`, dados.data_preferida && `Data preferida: ${dados.data_preferida.split('-').reverse().join('/')}`, dados.observacao && `Observação: ${dados.observacao}`, referencia && `Referência: ${referencia.nome}`].filter(Boolean).join(' | ')
    const item = { id: `bolo-personalizado-${crypto.randomUUID()}`, nome: `Bolo personalizado ${dados.tamanho} — ${dados.sabor}`, preco, imagem: referencia?.url || bannerBoloPersonalizadoMobile, quantidade: Number(dados.quantidade), tamanho: dados.tamanho, sabor: dados.sabor, decoracao: dados.decoracao, observacao: detalhes, personalizado: true }
    if (carrinho.some((atual) => atual.tipo === 'pronta_entrega')) {
      setAvisoEncomendaComPronta(true)
      return
    }
    incluirNoCarrinho(item, 'produto')
    setReferencia(null)
    setMostrarEncomenda(false)
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
    return <article className={classe} key={doce.id} data-aos="fade-up" onClick={(evento) => abrirDetalhesDoce(evento, doce)}>{doce.imagem ? <img src={doce.imagem} alt={doce.nome}/> : <div className="doce-sem-imagem">🧁</div>}<div><h3>{doce.nome}</h3><strong>R$ {Number(doce.preco).toFixed(2)}</strong><em>● {doce.quantidade_disponivel} disponíveis</em><button className="adicionar-pronta" onClick={(evento) => { evento.stopPropagation(); adicionarAoCarrinho(doce, 'pronta_entrega') }}>🛒 Adicionar</button></div></article>
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
      <div className="carrossel-banner" aria-label="Carrossel de banners da loja"><div className="carrossel-track" style={{ transform: `translateX(-${bannerAtual * 100}%)` }}>{banners.map((banner) => <div className="carrossel-slide" key={banner.src}><picture><source media="(max-width: 760px)" srcSet={banner.mobileSrc}/><img src={banner.src} alt={banner.alt}/></picture></div>)}</div><button className="carrossel-controle anterior" type="button" onClick={() => mudarBanner(-1)} aria-label="Banner anterior">‹</button><button className="carrossel-controle proximo" type="button" onClick={() => mudarBanner(1)} aria-label="Próximo banner">›</button><div className="carrossel-dots" aria-label="Indicadores do carrossel">{banners.map((banner, index) => <button key={banner.src} type="button" className={`carrossel-dot ${index === bannerAtual ? 'ativo' : ''}`} onClick={() => setBannerAtual(index)} aria-label={`Ir para o banner ${index + 1}`}/>)}</div></div><a className="indicador-rolagem" href="#pronta-entrega" aria-label="Ver doces à pronta entrega"><span>Role para ver</span><b>↓</b></a>
    </section>

    <section className="pronta-entrega pronta-entrega-banner" id="pronta-entrega" style={{ backgroundImage: `url(${bannerProntaEntrega})` }}><div className="conteudo-pronta"><div className="cabecalho-pronta" data-aos="fade-right"><p className="sobretitulo">disponível hoje</p><h2><span>Doces à</span><i>pronta entrega</i></h2><p>Escolha suas delícias e aproveite enquanto ainda temos por aqui. ♥</p></div><div className="grade-pronta">{docesProntaEntrega.slice(0, 4).map((doce) => cardDocePronta(doce))}</div>{docesProntaEntrega.length > 0 && <div className="acoes-pronta"><button className="ver-todos-pronta" onClick={() => setMostrarTodosPronta(true)}>Ver todos os produtos <b>→</b></button></div>}{docesProntaEntrega.length === 0 && <p className="sem-doces-pronta">Nenhum doce à pronta entrega disponível neste momento.</p>}</div></section>


    <section className="secao cardapio-novo" id="cardapio"><div className="centralizado"><p className="sobretitulo">nosso cardápio</p><h2>Qual delícia combina<br />com o seu momento?</h2></div><div className="categorias categorias-imagem">{categoriasCardapio.map(({ nome, texto, imagem }) => { return <button className={`categoria categoria-foto ${categoriaSelecionada === nome ? 'categoria-ativa' : ''}`} onClick={() => { setProdutoQuantidadePendente(null); setCategoriaAberta(nome) }} key={nome} aria-label={`Ver produtos da categoria ${nome}`}><img src={imagem} alt="" /><div><h3>{nome}</h3><small>{texto}</small></div><b>Ver produtos →</b></button> })}</div></section>

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
      <picture><source media="(max-width: 760px)" srcSet={bannerBoloPersonalizadoMobile}/><img src={bannerBoloPersonalizado} alt="Bolos personalizados: seu momento merece um bolo especial. Bolos feitos para transformar cada comemoração em uma lembrança deliciosa." width="1920" height="560" loading="lazy" /></picture>
      <button className="botao-banner-encomenda" type="button" aria-label="Personalizar meu bolo" aria-haspopup="dialog" onClick={() => { setReferencia(null); setGaleriaReferenciaAberta(false); setMostrarEncomenda(true) }} />
    </section>
    <CarrosselBolos />
    {mostrarEncomenda && <ModalEncomenda aoFechar={() => { setGaleriaReferenciaAberta(false); setMostrarEncomenda(false) }}>
      <form className="formulario" onSubmit={enviarPedido}>
        <input type="hidden" name="produto" value="Bolo personalizado" />
        <div className="linha-form"><label className="campo-encomenda">Tamanho<select name="tamanho" required defaultValue=""><option value="" disabled>Escolha o tamanho</option><option value="P">P</option><option value="M">M</option><option value="G">G</option></select></label><label className="campo-encomenda">Sabor<select name="sabor" required defaultValue=""><option value="" disabled>Escolha o sabor</option><option>Prestígio</option><option>Bombom de morango</option><option>Doce de leite com gotas</option><option>Maracujá trufado</option><option>Choconinho</option><option>Dois amores</option><option>Dois amores com bombom</option><option>Leite Ninho</option><option>Leite Ninho com morango</option><option>Leite Ninho com abacaxi</option><option>Leite Ninho com Nutella</option><option>Doce de leite</option><option>Doce de leite com morango</option><option>Doce de leite com nozes</option><option>Doce de leite com ameixa</option><option>Torta de abacaxi</option></select></label></div>
        <div className="linha-form"><label className="campo-encomenda">Decoração<input name="decoracao" required placeholder="Ex.: flores, tema, nome..." /></label><label className="campo-encomenda">Data da entrega<input name="data_preferida" required type="date" /></label></div>
        <div className="linha-form quantidade"><label className="campo-encomenda">Quantidade<input name="quantidade" required type="number" min="1" step="1" defaultValue="1" /></label><label className="campo-encomenda">Observação<textarea name="observacao" placeholder="Ex.: Quero o bolo com decoração rosa e branca e o nome Maria." rows="2" /></label></div>
        <div className="referencia"><div className="referencia-texto"><b>Foto de referência <small>(opcional)</small></b><span>Envie uma inspiração ou selecione um bolo da nossa galeria.</span></div><div className="acoes-imagem"><button className="galeria-botao" type="button" onClick={abrirGaleriaReferencia}>Ver galeria de bolos</button><label className="upload"><input type="file" accept="image/*" onChange={selecionarReferencia} /> Enviar imagem</label></div>{referencia && <div className="preview"><img src={referencia.url} alt="Referência enviada" /><small>{referencia.nome}</small><button type="button" onClick={() => setReferencia(null)}>×</button></div>}</div>
        <button className="botao enviar" type="submit">Adicionar ao carrinho</button>
      </form>
      {galeriaReferenciaAberta && <div className="galeria-referencia-fundo" onMouseDown={() => setGaleriaReferenciaAberta(false)}><section className="galeria-referencia" role="dialog" aria-modal="true" aria-label="Escolher foto de referência" onMouseDown={(event) => event.stopPropagation()}><header><div><p className="sobretitulo">INSPIRAÇÕES</p><h3>Escolha uma referência</h3></div><button type="button" onClick={() => setGaleriaReferenciaAberta(false)} aria-label="Fechar galeria">×</button></header>{carregandoFotosReferencia && <p>Carregando galeria...</p>}{erroFotosReferencia && <p className="galeria-referencia-erro">{erroFotosReferencia}</p>}{!carregandoFotosReferencia && !erroFotosReferencia && <div className="galeria-referencia-grade">{fotosReferencia.map((foto) => <button key={foto.id} type="button" onClick={() => selecionarFotoGaleria(foto)}><img src={foto.imagem} alt="Selecionar esta referência de bolo" /></button>)}</div>}{!carregandoFotosReferencia && !erroFotosReferencia && fotosReferencia.length === 0 && <p>A galeria ainda não possui fotos disponíveis.</p>}</section></div>}
    </ModalEncomenda>}

    <section className="sobre" id="sobre"><div className="sobre-conteudo"><p className="sobretitulo">um toque de carinho</p><h2>Doces feitos para celebrar você.</h2><p>Na Bolos da Lu, cada receita é preparada em pequenas fornadas, com ingredientes selecionados e cuidado em cada detalhe. Criamos bolos, docinhos, copos e kits personalizados para festas, presentes e momentos especiais. Faça sua encomenda e conte para a gente como você imagina essa delícia.</p><div className="sobre-detalhes"><strong>100%</strong><span>feito com carinho<br />em cada receita</span></div></div><div className="sobre-imagem"><i className="forma-amarela"/><i className="forma-rosa"/><img src={fotoLu} alt="Lu, confeiteira da Bolos da Lu, com um bolo"/><span>feito à mão ♥</span></div></section>
    <LojaFisica />
    <Avaliacoes usuario={usuario} aoEntrar={() => { setAuthCadastro(false); setMostrarAuth(true) }} />
    <footer className="rodape-site">© 2026 Bolos da Lu <span>•</span> Feito com muito amor ♥ {usuario?.papel === 'admin' && <><span>•</span><a href="#admin">Área administrativa</a></>}</footer>
    {avisoConta && <div className="aviso-conta-fundo"><div className="aviso-conta" role="status"><span className="icone-aviso-conta">♥</span><div><small>CONTA ACESSADA</small><b>{avisoConta}</b></div><button onClick={() => setAvisoConta('')} aria-label="Fechar aviso">×</button></div></div>}
    {mostrarMeusPedidos && usuario && <MeusPedidos usuario={usuario} aoFechar={() => setMostrarMeusPedidos(false)} />}
    {mostrarAuth && <Auth iniciarCadastro={authCadastro} onClose={() => setMostrarAuth(false)} onAutenticado={async () => { await carregarPerfil(); setMostrarAuth(false); setAvisoConta('Você entrou na sua conta com sucesso! ♥') }} />}
    {avisoCadastroCarrinho && <div className="aviso-mistura aviso-cadastro-carrinho"><div><span>♥</span><h2>Entre ou crie sua conta</h2><p>Para adicionar produtos ao carrinho e acompanhar seu pedido, você precisa estar cadastrado.</p><div><button onClick={() => setAvisoCadastroCarrinho(false)}>Agora não</button><button onClick={() => { setAvisoCadastroCarrinho(false); setAuthCadastro(false); setMostrarAuth(true) }}>Entrar</button><button onClick={() => { setAvisoCadastroCarrinho(false); setAuthCadastro(true); setMostrarAuth(true) }}>Cadastrar</button></div></div></div>}
    {avisoEncomendaComPronta && <div className="aviso-mistura"><div><span>🎂</span><h2>Finalize os doces primeiro</h2><p>Bolos personalizados são feitos por encomenda e não podem ser adicionados enquanto houver doces à pronta entrega no carrinho.</p><div><button onClick={() => setAvisoEncomendaComPronta(false)}>Continuar editando</button><button onClick={() => { setAvisoEncomendaComPronta(false); setCarrinhoAberto(true) }}>Ver carrinho</button></div></div></div>}
    {pedidoMisto && <div className="aviso-mistura"><div><span>🛒</span><h2>Escolha um tipo de pedido</h2><p>O carrinho não pode misturar delivery imediato e encomendas. Escolha quais itens deseja manter.</p><div><button onClick={() => { setCarrinho((itens) => itens.filter((item) => item.tipo === 'produto')); setPedidoMisto(false); setCarrinhoAberto(true) }}>Manter encomenda</button><button onClick={() => { setCarrinho((itens) => itens.filter((item) => item.tipo === 'pronta_entrega')); setPedidoMisto(false); setCarrinhoAberto(true) }}>Manter delivery</button></div></div></div>}
    {categoriaAberta && <div className="modal-categoria" onMouseDown={() => setCategoriaAberta(null)}><section onMouseDown={(e) => e.stopPropagation()}><button className="fechar-categoria" onClick={() => setCategoriaAberta(null)}>×</button><p className="sobretitulo">cardápio bolos da lu</p><h2>{categoriaAberta}</h2><p className="descricao-categoria">Escolha sua delícia e adicione ao carrinho.</p><ProdutosCategoria key={categoriaAberta} produtoQuantidadePendente={produtoQuantidadePendente} categoria={categoriaAberta} produtos={produtos} aoAdicionar={(produto, tipo) => { setCategoriaAberta(null); adicionarAoCarrinho(produto, tipo) }} /></section></div>}
    {doceAConfirmar && <div className="aviso-mistura"><div><span>{doceAConfirmar.tipo === 'pronta_entrega' ? '⚡' : '🎂'}</span><h2>Pedido separado</h2><p>{doceAConfirmar.tipo === 'pronta_entrega' ? 'Produtos de pronta entrega são enviados como delivery. Para adicioná-los, os itens de encomenda serão removidos do carrinho.' : 'Produtos por encomenda têm data de produção. Para adicioná-los, os itens de delivery serão removidos do carrinho.'}</p><div><button onClick={() => setDoceAConfirmar(null)}>Manter pedido atual</button><button onClick={() => { incluirNoCarrinho(doceAConfirmar.item, doceAConfirmar.tipo, true); setDoceAConfirmar(null) }}>{doceAConfirmar.tipo === 'pronta_entrega' ? 'Continuar com delivery' : 'Continuar com encomenda'}</button></div></div></div>}
    <CarrinhoCompra itens={carrinho} aberto={carrinhoAberto} aoFechar={() => setCarrinhoAberto(false)} aoAlterarQuantidade={alterarQuantidade} aoRemover={removerDoCarrinho} aoFinalizar={(dados) => { setCarrinho([]); setCarrinhoAberto(false); setPedidoWhatsApp(dados); if (dados.itens.every((item) => item.tipo === 'pronta_entrega')) listarDocesProntaEntrega().then(setDocesProntaEntrega) }} aoEntrar={() => { setAuthCadastro(false); setMostrarAuth(true) }} />
    {usuario?.id && <AvisoPagamentoPendente key={usuario.id} usuarioId={usuario.id} pedidoRecenteId={pedidoWhatsApp?.pedido.id} oculto={Boolean(pedidoWhatsApp) || carrinhoAberto} />}
    {pedidoWhatsApp && <ConfirmacaoWhatsApp dados={pedidoWhatsApp} aoFechar={() => setPedidoWhatsApp(null)} />}
    {mostrarTodosPronta && <div className="modal-todos-pronta" onMouseDown={() => setMostrarTodosPronta(false)}><section onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-todos-pronta" onClick={() => setMostrarTodosPronta(false)} aria-label="Fechar todos os doces">×</button><p className="sobretitulo">DISPONÍVEL HOJE</p><h2>Todos os doces<br /><i>à pronta entrega</i></h2><p>Escolha suas delícias e receba ou retire ainda hoje.</p><div className="grade-todos-pronta">{docesProntaEntrega.map((doce) => cardDocePronta(doce, 'todos-pronta-card'))}</div></section></div>}
    {detalheDocePronta && <div className="fundo-detalhe-pronta" onMouseDown={() => setDetalheDocePronta(null)}><aside className="detalhe-pronta" style={{ top: detalheDocePronta.top, left: detalheDocePronta.left }} onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-detalhe-pronta" onClick={() => setDetalheDocePronta(null)}>×</button>{detalheDocePronta.doce.imagem && <img src={detalheDocePronta.doce.imagem} alt={detalheDocePronta.doce.nome}/>}<p className="sobretitulo">PRONTA ENTREGA</p><h2>{detalheDocePronta.doce.nome}</h2><p>{detalheDocePronta.doce.descricao || 'Uma delícia preparada com carinho para adoçar o seu dia.'}</p><span className="estoque-detalhe-pronta">● {detalheDocePronta.doce.quantidade_disponivel} disponíveis</span></aside></div>}
    {detalheProduto && <div className="fundo-detalhe-pronta" onMouseDown={() => setDetalheProduto(null)}><aside className="detalhe-pronta detalhe-produto" style={{ top: detalheProduto.top, left: detalheProduto.left }} onMouseDown={(evento) => evento.stopPropagation()}><button className="fechar-detalhe-pronta" onClick={() => setDetalheProduto(null)}>×</button>{detalheProduto.produto.imagem && <img src={detalheProduto.produto.imagem} alt={detalheProduto.produto.nome}/>}<p className="sobretitulo">{detalheProduto.produto.categoria}</p><h2>{detalheProduto.produto.nome}</h2><p>{detalheProduto.produto.descricao || 'Uma delícia feita com ingredientes selecionados e muito carinho.'}</p></aside></div>}
    {confirmarSaida && <div className="aviso-conta-fundo"><section className="confirmar-saida" role="dialog" aria-modal="true" aria-label="Confirmar saída"><span>♥</span><p className="sobretitulo">ATÉ LOGO</p><h2>Deseja sair da conta?</h2><p>Você poderá entrar novamente quando quiser para acompanhar seus pedidos.</p><div><button onClick={() => setConfirmarSaida(false)}>Cancelar</button><button className="confirmar" onClick={confirmarLogout}>Sim, sair</button></div></section></div>}
  </main>
}
export default App
