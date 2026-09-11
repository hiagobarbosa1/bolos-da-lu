import { useState } from 'react'
import { cadastrarUsuario, entrar } from '../services/usuariosService'
import './Auth.css'
import './AuthFeedback.css'

export default function Auth({ onClose, onAutenticado, iniciarCadastro = false }) {
  const [cadastro, setCadastro] = useState(iniciarCadastro)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  async function enviar(event) {
    event.preventDefault(); setErro(''); setSucesso(''); setCarregando(true)
    const dados = Object.fromEntries(new FormData(event.currentTarget))
    try { const resultado = cadastro ? await cadastrarUsuario(dados) : await entrar(dados); if (cadastro && !resultado.session) { setSucesso('Conta criada! Confirme o e-mail enviado para entrar e finalizar pedidos.'); return } await onAutenticado() } catch (e) { setErro(e.message === 'Email not confirmed' ? 'Confirme seu e-mail antes de entrar.' : e.message) } finally { setCarregando(false) }
  }
  function trocarModo() { setCadastro(!cadastro); setErro(''); setSucesso('') }
  return <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Acesso à conta"><form className="auth-caixa" onSubmit={enviar}><button type="button" className="fechar-auth" onClick={onClose}>×</button><p className="auth-marca">♥ Bolos <i>da Lu</i></p><h2>{cadastro ? 'Crie sua conta' : 'Que bom ter você aqui!'}</h2><p>{cadastro ? 'Cadastre-se para acompanhar e enviar suas encomendas.' : 'Entre para fazer sua encomenda e acompanhar seus pedidos.'}</p>{cadastro && <label>Nome<input name="nome" required /></label>}<label>E-mail<input name="email" type="email" required /></label>{cadastro && <label>Telefone<input name="telefone" type="tel" /></label>}<label>Senha<input name="senha" type="password" minLength="6" required /></label>{erro && <span className="auth-erro">{erro}</span>}{sucesso && <span className="auth-sucesso">{sucesso}</span>}<button disabled={carregando || Boolean(sucesso)}>{carregando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}</button><small>{cadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <a href="#login" onClick={(e) => { e.preventDefault(); trocarModo() }}>{cadastro ? 'Entrar' : 'Criar conta'}</a></small></form></div>
}
