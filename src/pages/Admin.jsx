import AdminQuadroPedidos from '../components/AdminQuadroPedidos'
import PrecosTamanhosBolo from '../components/PrecosTamanhosBolo'
import AdminProdutosCategorias from '../components/AdminProdutosCategorias'
import ImagensBolo from '../components/ImagensBolo'
import { useEffect, useState } from 'react'
import { confirmarRecebimentoPix, atualizarStatusPedido, listarPedidos, prazoEntregaPedido } from '../services/pedidosService'
import { enviarImagemProduto, listarProdutos, removerProduto, salvarProduto } from '../services/produtosService'
import { listarClientes } from '../services/usuariosService'
import { listarDocesProntaEntrega, removerDoceProntaEntrega, salvarDoceProntaEntrega } from '../services/docesProntaEntregaService'
import AdminGaleriaBolos from '../components/AdminGaleriaBolos'
import AdminAvaliacoes from '../components/AdminAvaliacoes'
import AdminRelatorios from '../components/AdminRelatorios'
import AdminClientes from '../components/AdminClientes'
import './Admin.css'
import './AdminProdutos.css'
import { tiposDocinhos } from '../services/tiposDocinhos'

const produtoVazio = { nome: '', categoria: 'Bolos', preco: '', descricao: '', imagem: '', disponivel: true }

export default function Admin() {
  const [confirmandoPix, setConfirmandoPix] = useState(null)
  const [aba, setAba] = useState('Visão geral'); const [pedidos, setPedidos] = useState([]); const [produtos, setProdutos] = useState([]); const [clientes, setClientes] = useState([]); const [doces, setDoces] = useState([]); const [produtoEditado, setProdutoEditado] = useState(null); const [erro, setErro] = useState(''); const [agora, setAgora] = useState(Date.now()); const [pedidoArrastado, setPedidoArrastado] = useState(null); const [colunaDestino, setColunaDestino] = useState(null); const [salvandoImagem, setSalvandoImagem] = useState(false); const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(null); const [excluindo, setExcluindo] = useState(false)
  const [estadoPedidos, setEstadoPedidos] = useState('carregando')
  const [estadoClientes, setEstadoClientes] = useState('carregando')
  async function carregarConsultas() {
    const [resultadoPedidos, resultadoClientes] = await Promise.allSettled([listarPedidos(), listarClientes()])
    if (resultadoPedidos.status === 'fulfilled') { setPedidos(resultadoPedidos.value); setEstadoPedidos('pronto') }
    else setEstadoPedidos('erro')
    if (resultadoClientes.status === 'fulfilled') { setClientes(resultadoClientes.value); setEstadoClientes('pronto') }
    else setEstadoClientes('erro')
  }
  function atualizarConsultas() {
    setEstadoPedidos('carregando'); setEstadoClientes('carregando')
    carregarConsultas()
  }
  useEffect(() => {
    carregarConsultas()
    Promise.allSettled([listarProdutos(true), listarDocesProntaEntrega(true)]).then(([resultadoProdutos, resultadoDoces]) => {
      if (resultadoProdutos.status === 'fulfilled') setProdutos(resultadoProdutos.value)
      if (resultadoDoces.status === 'fulfilled') setDoces(resultadoDoces.value)
    })
  }, [])
  useEffect(() => { const intervalo = window.setInterval(() => setAgora(Date.now()), 1000); return () => window.clearInterval(intervalo) }, [])
  useEffect(() => { const soltarPedido = () => { if (pedidoArrastado && colunaDestino) trocarStatus(pedidoArrastado, colunaDestino); setPedidoArrastado(null); setColunaDestino(null) }; window.addEventListener('pointerup', soltarPedido); return () => window.removeEventListener('pointerup', soltarPedido) }, [pedidoArrastado, colunaDestino])
  const total = (status) => pedidos.filter((p) => p.status === status).length; const faturamento = pedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0)
  async function confirmarPix(id) {
    if (!window.confirm('Você conferiu no banco o recebimento do Pix deste pedido?')) return
    setConfirmandoPix(id); setErro('')
    try { const atualizado = await confirmarRecebimentoPix(id); setPedidos((lista) => lista.map((p) => p.id === id ? { ...p, ...atualizado } : p)) }
    catch (e) { setErro(e.message) }
    finally { setConfirmandoPix(null) }
  }
  async function trocarStatus(id, status) { try { await atualizarStatusPedido(id, status); setPedidos((itens) => itens.map((p) => p.id === id ? { ...p, status } : p)) } catch (e) { setErro(e.message) } }
  async function excluir(item, tipo = 'produto') { setExcluindo(true); try { if (tipo === 'doce') { await removerDoceProntaEntrega(item.id); setDoces((itens) => itens.filter((d) => d.id !== item.id)) } else { await removerProduto(item.id); setProdutos((itens) => itens.filter((p) => p.id !== item.id)) } } catch (e) { setErro(e.message) } finally { setExcluindo(false); setConfirmacaoExclusao(null) } }
  async function salvar(event) {
    event.preventDefault()
    const dados = Object.fromEntries(new FormData(event.currentTarget))
    const { imagem_arquivo, imagem_redondo_arquivo, imagem_retangular_arquivo, ...campos } = dados
    setErro(''); setSalvandoImagem(true)
    try {
      let imagem = produtoEditado.imagem
      const fotos = {}
      if (campos.categoria === 'Bolos') {
        for (const tamanho of ['p', 'm', 'g']) {
          const preco = Number(campos['preco_' + tamanho])
          if (campos['preco_' + tamanho] === '' || !Number.isFinite(preco) || preco < 0) throw new Error('Preencha os preços P, M e G.')
          campos['preco_' + tamanho] = preco
          campos['fatias_' + tamanho] = campos['fatias_' + tamanho]?.trim() || null
        }
        campos.preco = campos.preco_p
        if ((!imagem_redondo_arquivo?.size && !(produtoEditado.imagem_redondo || imagem)) || (!imagem_retangular_arquivo?.size && !produtoEditado.imagem_retangular)) throw new Error('Adicione uma foto do bolo redondo e outra do retangular.')
        fotos.imagem_redondo = imagem_redondo_arquivo?.size ? await enviarImagemProduto(imagem_redondo_arquivo) : produtoEditado.imagem_redondo || imagem
        fotos.imagem_retangular = imagem_retangular_arquivo?.size ? await enviarImagemProduto(imagem_retangular_arquivo) : produtoEditado.imagem_retangular
        imagem = fotos.imagem_redondo
      } else if (imagem_arquivo?.size) imagem = await enviarImagemProduto(imagem_arquivo)
      const produto = { ...produtoEditado, ...campos, ...fotos, imagem, preco: Number(campos.preco), disponivel: campos.disponivel === 'on' }
      const salvo = await salvarProduto(produto)
      setProdutos((itens) => produto.id ? itens.map((p) => p.id === salvo.id ? salvo : p) : [...itens, salvo])
      setProdutoEditado(null)
    } catch (e) { setErro(/preco_[pmg]|fatias_[pmg]/.test(e.message || '') ? 'Execute supabase/migration_tamanhos_bolos.sql no SQL Editor do Supabase antes de salvar.' : e.message?.includes('imagem_redondo') || e.message?.includes('imagem_retangular') ? 'Atualize o banco executando supabase/migration_formatos_bolos.sql no SQL Editor do Supabase.' : e.message) }
    finally { setSalvandoImagem(false) }
  }
  async function alternarDisponibilidade(produto) { try { const salvo = await salvarProduto({ ...produto, disponivel: !produto.disponivel }); setProdutos((itens) => itens.map((p) => p.id === salvo.id ? salvo : p)) } catch (e) { setErro(e.message) } }
  async function salvarDoce(event) { event.preventDefault(); const dados = Object.fromEntries(new FormData(event.currentTarget)); const arquivo = dados.imagem_arquivo; delete dados.imagem_arquivo; const { tipo, categoria, ...doceBase } = produtoEditado; setErro(''); setSalvandoImagem(true); try { const imagem = arquivo?.size ? await enviarImagemProduto(arquivo) : doceBase.imagem; const doce = { ...doceBase, ...dados, imagem, preco: Number(dados.preco), quantidade_disponivel: Number(dados.quantidade_disponivel), disponivel: dados.disponivel === 'on' }; const salvo = await salvarDoceProntaEntrega(doce); setDoces((itens) => doce.id ? itens.map((d) => d.id === salvo.id ? salvo : d) : [...itens, salvo]); setProdutoEditado(null) } catch (e) { setErro(e.message) } finally { setSalvandoImagem(false) } }
  return <div className="admin"><aside><a href="#inicio">♥ Bolos <i>da Lu</i></a><small>PAINEL ADMINISTRATIVO</small>{['Visão geral', 'Pedidos', 'Produtos', 'Pronta entrega', 'Galeria de bolos', 'Avalia\u00e7\u00f5es', 'Clientes', 'Relatórios'].map((nome) => <button className={aba === nome ? 'ativo' : ''} onClick={() => setAba(nome)} key={nome}>{nome}</button>)}</aside><section><header><div><small>Olá, Lu! ✦</small><h1>{aba}</h1></div><a href="#inicio">Ver loja ↗</a></header>{erro && <p className="erro">{erro}</p>}
    {aba === 'Visão geral' && <><div className="metricas"><Card valor={total('novo')} texto="NOVOS" /><Card valor={total('producao')} texto="PRODUÇÃO" /><Card valor={total('pronto')} texto="PRONTOS" /><Card valor={`R$ ${faturamento.toFixed(2)}`} texto="FATURAMENTO" /></div><h2>Pedidos recentes</h2><Lista pedidos={pedidos.slice(0, 5)} /></>}
    {aba === 'Pedidos' && <AdminQuadroPedidos pedidos={pedidos} estado={estadoPedidos} aoAtualizar={atualizarConsultas} agora={agora} pedidoArrastado={pedidoArrastado} colunaDestino={colunaDestino} aoArrastar={setPedidoArrastado} aoDestino={setColunaDestino} aoStatus={trocarStatus} aoConfirmarPix={confirmarPix} confirmandoPix={confirmandoPix} />}
    {aba === 'Produtos' && <><button className="adicionar" onClick={() => setProdutoEditado(produtoVazio)}>+ Cadastrar produto</button><AdminProdutosCategorias produtos={produtos} aoEditar={setProdutoEditado} aoExcluir={(produto) => setConfirmacaoExclusao({ item: produto, tipo: 'produto' })} aoAlternar={alternarDisponibilidade} /></>}
    {aba === 'Pronta entrega' && <><button className="adicionar" onClick={() => setProdutoEditado({ ...produtoVazio, quantidade_disponivel: 1, tipo: 'doce' })}>+ Adicionar doce</button><div className="lista-admin produtos-admin">{doces.map((d) => <article key={d.id}>{d.imagem ? <img src={d.imagem} alt={d.nome} /> : <div className="sem-imagem">🧁</div>}<div className="dados-produto"><b>{d.nome}</b><small>R$ {Number(d.preco).toFixed(2)} · {d.quantidade_disponivel} em estoque</small><small>{d.descricao || 'Sem descrição'}</small></div><div className="acoes-produto"><button onClick={() => setProdutoEditado({ ...d, tipo: 'doce' })}>Editar</button><button onClick={() => setConfirmacaoExclusao({ item: d, tipo: 'doce' })}>Excluir</button></div></article>)}</div></>}
    {aba === 'Galeria de bolos' && <AdminGaleriaBolos />}
    {aba === 'Avalia\u00e7\u00f5es' && <AdminAvaliacoes />}
    {aba === 'Clientes' && <AdminClientes clientes={clientes} pedidos={pedidos} estadoClientes={estadoClientes} estadoPedidos={estadoPedidos} aoAtualizar={atualizarConsultas} />}
    {aba === 'Relatórios' && <AdminRelatorios pedidos={pedidos} estado={estadoPedidos} aoAtualizar={atualizarConsultas} />}
  </section>{produtoEditado && <ModalProduto produto={produtoEditado} aoFechar={() => setProdutoEditado(null)} aoSalvar={produtoEditado.tipo === 'doce' ? salvarDoce : salvar} salvando={salvandoImagem} erro={erro} />}{confirmacaoExclusao && <div className="admin-confirmacao-fundo" role="presentation" onMouseDown={() => { if (!excluindo) setConfirmacaoExclusao(null) }}><section className="admin-confirmacao" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><span className="admin-confirmacao-icone" aria-hidden="true">!</span><h2>Excluir {confirmacaoExclusao.tipo === 'doce' ? 'doce' : 'produto'}?</h2><p><strong>{confirmacaoExclusao.item.nome}</strong> será removido do catálogo.</p><div><button type="button" disabled={excluindo} onClick={() => setConfirmacaoExclusao(null)}>Cancelar</button><button type="button" className="confirmar" disabled={excluindo} onClick={() => excluir(confirmacaoExclusao.item, confirmacaoExclusao.tipo)}>{excluindo ? 'Excluindo...' : 'Excluir'}</button></div></section></div>}</div>
}
function ModalProduto({ produto, aoFechar, aoSalvar, salvando, erro }) { const doce = produto.tipo === 'doce'; const [categoria, setCategoria] = useState(produto.categoria); const [preco, setPreco] = useState(produto.preco); const porCento = !doce && ['Docinhos', 'Doces'].includes(categoria); const [previa, setPrevia] = useState(produto.imagem || ''); return <div className="produto-modal"><form className="produto-form" onSubmit={aoSalvar}><button className="fechar-produto" type="button" onClick={aoFechar}>×</button><p className="sobretitulo">{doce ? 'pronta entrega' : 'catálogo'}</p><h2>{produto.id ? 'Editar produto' : doce ? 'Adicionar doce' : 'Cadastrar produto'}</h2>{erro && <p className="erro-upload-produto">{erro.includes('Bucket not found') ? 'O armazenamento de imagens ainda não foi configurado. Execute o arquivo SQL de migração no Supabase.' : erro}</p>}<div className="campos-produto"><label>Nome do produto<input name="nome" defaultValue={produto.nome} required /></label>{!doce && <label>Tipo / categoria<select name="categoria" value={categoria} onChange={(event) => { setCategoria(event.target.value); if (event.target.value === "Docinhos") setPreco("") }}><option>Bolos</option><option>Docinhos</option><option>Kits</option><option>Copos e doces</option></select></label>}{!doce && categoria === "Bolos" ? <PrecosTamanhosBolo produto={produto} /> : <label>{porCento ? "Linha de doces" : "Preço (R$)"}{porCento ? <select name="preco" value={tiposDocinhos.some((tipo) => tipo.preco === Number(preco)) ? preco : ""} onChange={(event) => setPreco(event.target.value)} required><option value="" disabled>Selecione a linha</option>{tiposDocinhos.map((tipo) => <option key={tipo.nome} value={tipo.preco}>{tipo.nome}</option>)}</select> : <input name="preco" type="number" min="0" step="0.01" value={preco} onChange={(event) => setPreco(event.target.value)} required />}</label>}{doce && <label>Quantidade disponível<input name="quantidade_disponivel" type="number" min="0" defaultValue={produto.quantidade_disponivel} required /></label>}{!doce && categoria === "Bolos" ? <ImagensBolo produto={produto} /> : <label className={!doce ? '' : 'campo-total imagem-upload-produto'}>Imagem do produto<input name="imagem_arquivo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(evento) => { const arquivo = evento.target.files?.[0]; if (arquivo) setPrevia(URL.createObjectURL(arquivo)) }} /><span>Escolha uma foto do computador (JPG ou JPEG, PNG ou WEBP, até 5 MB).</span>{previa && <img src={previa} alt="Prévia da imagem do produto" />}</label>}<label className="campo-total">Descrição<textarea name="descricao" defaultValue={produto.descricao || ''} rows="4" required /></label><label className="disponivel"><input name="disponivel" type="checkbox" defaultChecked={produto.disponivel} /> Disponível para venda</label></div><div className="botoes-form"><button type="button" onClick={aoFechar} disabled={salvando}>Cancelar</button><button type="submit" disabled={salvando}>{salvando ? 'Enviando imagem...' : 'Salvar produto →'}</button></div></form></div> }
function Card({ valor, texto }) { return <article><b>{valor}</b><span>{texto}</span></article> }
function Lista({ pedidos }) { return <div className="lista-admin">{pedidos.map((p) => { const prazo = prazoEntregaPedido(p.criado_em); return <article key={p.id}><div><b>#{p.id} · {p.usuarios?.nome || 'Cliente'}</b><small>{p.status} · pedido feito: {prazo.realizado}</small><small>Pagamento: {p.forma_pagamento || 'Não informado'}</small><small>Estimativa: {prazo.estimativa}</small></div><b>R$ {Number(p.valor_total).toFixed(2)}</b></article> })}</div> }
