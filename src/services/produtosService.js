import { supabase } from '../lib/supabaseClient'

export async function listarProdutos(incluirIndisponiveis = false) {
  let query = supabase.from('produtos').select('*').order('nome')
  if (!incluirIndisponiveis) query = query.eq('disponivel', true)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function salvarProduto(produto) {
  const { id, ...dados } = produto
  const query = id
    ? supabase.from('produtos').update(dados).eq('id', id)
    : supabase.from('produtos').insert(dados)
  const { data, error } = await query.select().single()
  if (error) throw error
  return data
}

export async function removerProduto(id) {
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) throw error
}

export async function enviarImagemProduto(arquivo) {
  if (!arquivo?.size) return null
  if (!arquivo.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem válido.')
  if (arquivo.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.')

  const { data: sessao, error: erroSessao } = await supabase.auth.getUser()
  if (erroSessao) throw erroSessao
  if (!sessao.user) throw new Error('Entre como administradora para enviar imagens.')

  const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const caminho = `${sessao.user.id}/${Date.now()}-${crypto.randomUUID()}.${extensao}`
  const { error: erroUpload } = await supabase.storage.from('produtos').upload(caminho, arquivo, { cacheControl: '3600', upsert: false })
  if (erroUpload) throw erroUpload

  const { data } = supabase.storage.from('produtos').getPublicUrl(caminho)
  return data.publicUrl
}
