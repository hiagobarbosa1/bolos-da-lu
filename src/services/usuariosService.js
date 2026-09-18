import { listarTodasPaginas } from './listarTodasPaginas'
import { supabase } from '../lib/supabaseClient'

export async function cadastrarUsuario({ nome, email, senha, telefone }) {
  const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome, telefone } } })
  if (error) throw error
  return data
}

export async function listarClientes() {
  return listarTodasPaginas(() => supabase.from('usuarios').select('id, nome, email, telefone, criado_em').eq('papel', 'cliente').order('criado_em', { ascending: false }).order('id'))
}

export async function entrar({ email, senha }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function perfilAtual() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('usuarios').select('id, nome, email, papel').eq('id', user.id).maybeSingle()
  if (data) return data

  const perfil = {
    id: user.id,
    nome: user.user_metadata?.nome || user.email.split('@')[0],
    email: user.email,
    telefone: user.user_metadata?.telefone || null,
    papel: 'cliente',
  }
  const { data: novoPerfil, error: erroPerfil } = await supabase.from('usuarios').upsert(perfil).select('id, nome, email, papel').single()
  if (!erroPerfil) return novoPerfil
  if (error) console.warn('Perfil não encontrado no banco:', error.message)
  return perfil
}
