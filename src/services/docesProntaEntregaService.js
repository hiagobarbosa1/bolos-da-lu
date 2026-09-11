import { supabase } from '../lib/supabaseClient'

export async function listarDocesProntaEntrega(incluirIndisponiveis = false) {
  let query = supabase.from('doces_pronta_entrega').select('*').order('criado_em', { ascending: false })
  if (!incluirIndisponiveis) query = query.eq('disponivel', true).gt('quantidade_disponivel', 0)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function salvarDoceProntaEntrega(doce) {
  const { id, ...dados } = doce
  const query = id ? supabase.from('doces_pronta_entrega').update(dados).eq('id', id) : supabase.from('doces_pronta_entrega').insert(dados)
  const { data, error } = await query.select().single()
  if (error) throw error
  return data
}

export async function removerDoceProntaEntrega(id) {
  const { error } = await supabase.from('doces_pronta_entrega').delete().eq('id', id)
  if (error) throw error
}
