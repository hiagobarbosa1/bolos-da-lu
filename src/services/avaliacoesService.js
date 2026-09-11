import { supabase } from '../lib/supabaseClient'

const tipos = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export function validarFotoAvaliacao(arquivo) {
  if (!arquivo) return
  if (!tipos[arquivo.type] || !arquivo.size) throw new Error('Escolha uma foto JPG, PNG ou WebP.')
  if (arquivo.size > 5 * 1024 * 1024) throw new Error('A foto deve ter no máximo 5 MB.')
}

export async function listarAvaliacoes(pagina = 0) {
  const { data, error } = await supabase.from('avaliacoes')
    .select('id, nome, nota, comentario, imagem_path, criado_em')
    .order('criado_em', { ascending: false }).order('id', { ascending: false })
    .range(pagina * 6, pagina * 6 + 6)
  if (error) throw error
  return { mais: data.length > 6, itens: data.slice(0, 6).map((item) => ({ ...item,
    imagem: item.imagem_path ? supabase.storage.from('avaliacoes').getPublicUrl(item.imagem_path).data.publicUrl : null,
  })) }
}

export async function publicarAvaliacao({ nota, comentario, arquivo }) {
  validarFotoAvaliacao(arquivo)
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new Error('Selecione de 1 a 5 estrelas.')
  if (comentario.trim().length < 3 || comentario.trim().length > 1000) throw new Error('Escreva entre 3 e 1000 caracteres.')
  const { data: { user }, error: erroAuth } = await supabase.auth.getUser()
  if (erroAuth || !user) throw new Error('Entre na sua conta para publicar sua avaliação.')
  let caminho = null
  if (arquivo) {
    caminho = `${user.id}/${crypto.randomUUID()}.${tipos[arquivo.type]}`
    const { error } = await supabase.storage.from('avaliacoes').upload(caminho, arquivo, { contentType: arquivo.type })
    if (error) {
      if (error.message?.toLowerCase().includes('bucket')) throw new Error('O armazenamento de fotos ainda não foi configurado. Execute a migration_avaliacoes.sql no Supabase.')
      throw new Error(error.message || 'Não foi possível enviar a foto. Tente novamente.')
    }
  }
  const { error } = await supabase.rpc('publicar_avaliacao', { p_nota: nota, p_comentario: comentario.trim(), p_imagem_path: caminho })
  if (error) {
    if (caminho) await supabase.storage.from('avaliacoes').remove([caminho]).catch(() => {})
    const mensagem = error.message?.toLowerCase() || ''
    if (mensagem.includes('could not find the function') || mensagem.includes('schema cache')) {
      throw new Error('A tabela de avaliações ainda não foi configurada. Execute a migration_avaliacoes.sql no Supabase.')
    }
    throw new Error(error.message || 'Não foi possível publicar sua avaliação. Tente novamente em instantes.')
  }
}
