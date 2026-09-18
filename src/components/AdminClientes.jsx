import { useEffect, useMemo, useRef, useState } from 'react'
import { buscarClientes, pedidosDoCliente, resumoVendas, moedaAdmin, dataAdmin } from '../services/consultasAdmin'
import AdminHistoricoPedidos from './AdminHistoricoPedidos'
import './AdminConsultas.css'

export default function AdminClientes({ clientes, pedidos, estadoClientes, estadoPedidos, aoAtualizar }) {
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const painelHistorico = useRef(null)
  useEffect(() => {
    if (!selecionado) return
    painelHistorico.current?.focus({ preventScroll: true })
    painelHistorico.current?.scrollIntoView({ block: 'start' })
  }, [selecionado])
  const encontrados = useMemo(() => buscarClientes(clientes, busca), [clientes, busca])
  const cliente = clientes.find((item) => item.id === selecionado)
  const historico = useMemo(() => pedidosDoCliente(pedidos, selecionado), [pedidos, selecionado])
  const resumo = resumoVendas(historico)
  return <div className="admin-consultas">
    <div className="consulta-filtros"><label>Buscar cliente<input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Nome, e-mail ou telefone" /></label><button type="button" disabled={estadoClientes === 'carregando' || estadoPedidos === 'carregando'} onClick={aoAtualizar}>Atualizar dados</button></div>
    {estadoClientes === 'carregando' ? <p role="status">Carregando clientes…</p> : estadoClientes === 'erro' ? <p className="erro" role="alert">Não foi possível carregar os clientes. Tente atualizar os dados.</p> : <>
      <p role="status">{encontrados.length} cliente(s) encontrado(s)</p>
      <div className="clientes-consulta">{encontrados.map((item) => <article key={item.id}>
        <div><h3>{item.nome}</h3><p>{item.email}</p><p>{item.telefone || 'Telefone não informado'}</p><small>Cadastro: {dataAdmin(item.criado_em)}</small></div>
        <button type="button" aria-expanded={selecionado === item.id} aria-controls="historico-cliente" onClick={() => setSelecionado(item.id)}>Ver histórico de pedidos</button>
      </article>)}</div>
      {!encontrados.length && <p className="consulta-vazia">{clientes.length ? 'Nenhum cliente corresponde à busca.' : 'Ainda não há clientes cadastrados.'}</p>}
      {cliente && <section ref={painelHistorico} tabIndex={-1} className="cliente-historico" id="historico-cliente" aria-label={`Histórico de ${cliente.nome}`}>
        <div className="cliente-historico-titulo"><h2>Histórico de {cliente.nome}</h2><button type="button" onClick={() => setSelecionado(null)}>Fechar histórico</button></div>
        <p>{cliente.email} · {cliente.telefone || 'Telefone não informado'}</p>
        {estadoPedidos === 'carregando' ? <p role="status">Carregando histórico…</p> : estadoPedidos === 'erro' ? <p className="erro" role="alert">Não foi possível carregar o histórico. Tente atualizar os dados.</p> : <>
          <p><b>{resumo.quantidade} pedido(s)</b> · Total sem cancelamentos: <b>{moedaAdmin(resumo.total)}</b> · {resumo.cancelados} cancelado(s)</p>
          <AdminHistoricoPedidos pedidos={historico} />
        </>}
      </section>}
    </>}
  </div>
}
