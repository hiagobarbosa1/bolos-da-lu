import { supabase } from '../lib/supabaseClient'

const bucket = 'galeria-bolos'
const tipos = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const comImagem = (foto) => ({ ...foto, imagem: supabase.storage.from(bucket).getPublicUrl(foto.imagem_path).data.publicUrl })

export async function listarGaleriaBolos(admin = false) {
  let query = supabase.from('galeria_bolos').select('*').order('ordem').order('id')
  if (!admin) query = query.eq('ativo', true)
  const { data, error } = await query
  if (error) throw error
  return data.map(comImagem)
}

export async function salvarFotoGaleria({ id, ordem, ativo, arquivo }) {
  if (!Number.isInteger(ordem) || ordem < 0) throw new Error('A ordem deve ser um número inteiro a partir de zero.')
  let caminho
  if (!id) {
    if (!arquivo?.size || !tipos[arquivo.type]) throw new Error('Selecione uma foto JPG, PNG ou WebP.')
    if (arquivo.size > 5 * 1024 * 1024) throw new Error('A foto deve ter no máximo 5 MB.')
    caminho = `${crypto.randomUUID()}.${tipos[arquivo.type]}`
    const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, { contentType: arquivo.type, upsert: false })
    if (error) throw error
  }
  const dados = { ordem, ativo }
  const query = id ? supabase.from('galeria_bolos').update(dados).eq('id', id) : supabase.from('galeria_bolos').insert({ ...dados, imagem_path: caminho })
  const { data, error } = await query.select().single()
  if (error) {
    if (caminho) await supabase.storage.from(bucket).remove([caminho]).catch(() => {})
    throw error
  }
  return comImagem(data)
}

export async function removerFotoGaleria(foto) {
  const { error } = await supabase.from('galeria_bolos').delete().eq('id', foto.id).select('id').single()
  if (error) throw error
  const { error: erroArquivo } = await supabase.storage.from(bucket).remove([foto.imagem_path])
  return erroArquivo ? 'Foto removida da galeria. Não foi possível apagar o arquivo do armazenamento.' : ''
}
