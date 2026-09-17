import { validarAgendamento, diaNaDoceria, previsaoEntrega, resumoRetirada } from './horariosRetirada'
import { formasPagamento } from './formasPagamento'
import { supabase } from '../lib/supabaseClient'

export function prazoEntregaPedido(criadoEm) {
  const feitoEm = new Date(criadoEm)
  const previsao = previsaoEntrega(feitoEm)
  const inicio = previsao?.inicio || new Date(feitoEm.getTime() + 60 * 60 * 1000)
  const fim = previsao?.fim || new Date(feitoEm.getTime() + 120 * 60 * 1000)
  const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
  const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
  return { realizado: formatoData.format(feitoEm), estimativa: `${formatoHora.format(inicio)} às ${formatoHora.format(fim)}`, inicio, fim }
}

export async function listarPedidos() {
  const { data, error } = await supabase.from('pedidos').select('*, usuarios(nome, telefone), itens_pedido(*, produtos(nome))').order('criado_em', { ascending: false })
  if (error) throw error
  return data
}

export async function listarMeusPedidos() {
  const { data: sessao, error: erroSessao } = await supabase.auth.getUser()
  if (erroSessao) throw erroSessao
  if (!sessao.user) throw new Error('Entre na sua conta para acompanhar seus pedidos.')
  const { data, error } = await supabase.from('pedidos').select('*, itens_pedido(*, produtos(nome))').eq('usuario_id', sessao.user.id).order('criado_em', { ascending: false })
  if (error) throw error
  return data
}

export function acompanharPedidosEmTempoReal(usuarioId, aoAtualizar, origem = 'cliente') {
  const canal = supabase.channel(`pedidos-${origem}-${usuarioId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `usuario_id=eq.${usuarioId}` }, aoAtualizar).subscribe()
  return () => supabase.removeChannel(canal)
}

export async function criarPedido({ pedido, item, referencia }) {
  const { data: sessao, error: erroSessao } = await supabase.auth.getUser()
  if (erroSessao) throw erroSessao
  if (!sessao.user) throw new Error('Faça login para enviar sua encomenda.')

  const { data: novoPedido, error: erroPedido } = await supabase.from('pedidos').insert({ ...pedido, usuario_id: sessao.user.id }).select().single()
  if (erroPedido) throw erroPedido
  const { error: erroItem } = await supabase.from('itens_pedido').insert({ ...item, pedido_id: novoPedido.id })
  if (erroItem) throw erroItem

  if (referencia) {
    const caminho = `${sessao.user.id}/${novoPedido.id}-${Date.now()}.jpg`
    const { error: erroUpload } = await supabase.storage.from('referencias').upload(caminho, referencia)
    if (erroUpload) throw erroUpload
    const { error: erroReferencia } = await supabase.from('referencias').insert({ pedido_id: novoPedido.id, imagem: caminho })
    if (erroReferencia) throw erroReferencia
  }
  return novoPedido
}

export async function finalizarCarrinho({ dataEntrega, endereco, itens, formaPagamento, modalidade, horarioRetirada }) {
  if (!formasPagamento.includes(formaPagamento)) throw new Error('Selecione a forma de pagamento.')
  const { data: sessao, error: erroSessao } = await supabase.auth.getUser()
  if (erroSessao) throw erroSessao
  if (!sessao.user) throw new Error('Entre na sua conta para finalizar o pedido.')
  const prontaEntrega = itens.length > 0 && itens.every((item) => item.tipo === 'pronta_entrega')
  if (modalidade === 'retirada' || !prontaEntrega) validarAgendamento(dataEntrega, horarioRetirada, prontaEntrega)
  else if (dataEntrega !== diaNaDoceria() || !previsaoEntrega()) throw new Error('Não há mais horários de pronta entrega para hoje.')
  if (modalidade === 'retirada') endereco = resumoRetirada(dataEntrega, horarioRetirada)
  if (prontaEntrega) {
    const { data, error } = await supabase.rpc('finalizar_pedido_pronta_entrega', {
      p_data_entrega: dataEntrega,
      p_endereco: endereco || null,
      p_forma_pagamento: formaPagamento,
      p_itens: itens.map((item) => ({ id: item.id, quantidade: item.quantidade })),
    })
    if (error?.message?.includes('Could not find the function')) {
      throw new Error('Não foi possível registrar o pedido. O sistema de pedidos precisa de uma atualização pela doceria. Tente novamente mais tarde.')
    }
    if (error) throw error
    return data
  }

  const valorTotal = itens.reduce((total, item) => total + item.preco * item.quantidade, 0)
  const { data: pedido, error: erroPedido } = await supabase.from('pedidos').insert({ usuario_id: sessao.user.id, data_entrega: dataEntrega, endereco, forma_pagamento: formaPagamento, valor_total: valorTotal }).select().single()
  if (erroPedido) throw erroPedido
  const itensPedido = itens.map((item) => ({
    pedido_id: pedido.id,
    produto_id: item.tipo === 'produto' && !item.personalizado ? item.id : null,
    nome_produto: item.nome,
    tipo_item: item.personalizado ? 'bolo_personalizado' : item.tipo,
    quantidade: item.quantidade,
    tamanho: item.tamanho || null,
    sabor: item.sabor || null,
    decoracao: item.decoracao || null,
    observacao: item.observacao || null,
  }))
  const { error: erroItens } = await supabase.from('itens_pedido').insert(itensPedido)
  if (erroItens) throw erroItens
  return pedido
}

export async function atualizarStatusPedido(id, status) {
  const { error } = await supabase.from('pedidos').update({ status }).eq('id', id)
  if (error) throw error
}

export async function confirmarRecebimentoPix(id) {
  const { data, error } = await supabase.rpc('confirmar_recebimento_pix', { p_pedido_id: id })
  if (error?.message?.includes('Could not find the function')) throw new Error('Execute migration_confirmacao_pix.sql no Supabase para habilitar a confirmação do Pix.')
  if (error) throw error
  return data
}
