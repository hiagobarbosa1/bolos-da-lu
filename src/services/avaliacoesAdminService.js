import { supabase } from '../lib/supabaseClient'

export async function listarAvaliacoesAdmin() {
  const { data, error } = await supabase.from('avaliacoes').select('id, nome, nota, comentario, imagem_path, criado_em').order('criado_em', { ascending: false })
  if (error) throw error
  return data.map((item) => ({ ...item, imagem: item.imagem_path ? supabase.storage.from('avaliacoes').getPublicUrl(item.imagem_path).data.publicUrl : null }))
}

export async function removerAvaliacao(avaliacao) {
  const { error } = await supabase.from('avaliacoes').delete().eq('id', avaliacao.id)
  if (error) throw error
  if (avaliacao.imagem_path) {
    const { error: erroFoto } = await supabase.storage.from('avaliacoes').remove([avaliacao.imagem_path])
    if (erroFoto) return 'Avaliação excluída, mas a foto não pôde ser removida.'
  }
  return ''
}
