import { useEffect, useState } from 'react'
import { listarGaleriaBolos, removerFotoGaleria, salvarFotoGaleria } from '../services/galeriaBolosService'
import './AdminGaleriaBolos.css'

function mensagemErro(erro) {
  if (/schema cache|does not exist|Bucket not found/i.test(erro.message || '')) return 'Execute migration_galeria_bolos.sql no Supabase para habilitar a galeria.'
  return erro.message || 'Não foi possível atualizar a galeria.'
}

export default function AdminGaleriaBolos() {
  const [fotos, setFotos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [editada, setEditada] = useState(null)
  const [arquivo, setArquivo] = useState(null)
  const [previa, setPrevia] = useState('')
  const [versaoForm, setVersaoForm] = useState(0)
  useEffect(() => {
    let ativo = true
    listarGaleriaBolos(true).then((lista) => { if (ativo) setFotos(lista) }).catch((e) => { if (ativo) setErro(mensagemErro(e)) }).finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])
  function limpar() { setEditada(null); setArquivo(null); setPrevia(''); setVersaoForm((v) => v + 1) }
  async function salvar(event) {
    event.preventDefault()
    const dados = Object.fromEntries(new FormData(event.currentTarget))
    setSalvando(true); setErro(''); setAviso('')
    try {
      const foto = await salvarFotoGaleria({ id: editada?.id, ordem: Number(dados.ordem), ativo: dados.ativo === 'on', arquivo })
      setFotos((lista) => [...lista.filter((item) => item.id !== foto.id), foto].sort((a, b) => a.ordem - b.ordem || a.id - b.id))
      limpar(); setAviso('Foto salva na galeria.')
    } catch (e) { setErro(mensagemErro(e)) } finally { setSalvando(false) }
  }
  async function remover(foto) {
    if (!window.confirm(`Remover a foto #${foto.id} do carrossel?`)) return
    setSalvando(true); setErro(''); setAviso('')
    try {
      const mensagem = await removerFotoGaleria(foto)
      setFotos((lista) => lista.filter((item) => item.id !== foto.id))
      if (editada?.id === foto.id) limpar()
      setAviso(mensagem || 'Foto removida.')
    } catch (e) { setErro(mensagemErro(e)) } finally { setSalvando(false) }
  }
  return <div className="admin-galeria">
    <p>Fotos exibidas abaixo do banner de bolos personalizados. A ordem menor aparece primeiro; use pelo menos três fotos para destacar o efeito de pirâmide.</p>
    {erro && <p className="galeria-erro" role="alert">{erro}</p>}{aviso && <p role="status">{aviso}</p>}
    <form key={`${editada?.id || 'nova'}-${versaoForm}`} onSubmit={salvar} className="galeria-form">
      <h2>{editada ? 'Editar foto' : 'Adicionar foto'}</h2>
      <fieldset disabled={salvando || carregando}>

        {!editada && <label>Foto (JPG, PNG ou WebP, até 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => { const foto = e.target.files?.[0] || null; setArquivo(foto); setPrevia(foto ? URL.createObjectURL(foto) : '') }} /></label>}
        {(editada?.imagem || (arquivo && previa)) && <img className="galeria-previa" src={editada?.imagem || previa} alt="Prévia da foto" />}
        <label>Ordem de exibição<input type="number" name="ordem" required min="0" step="1" defaultValue={editada?.ordem ?? fotos.length} /></label>
        <label className="galeria-ativo"><input type="checkbox" name="ativo" defaultChecked={editada?.ativo ?? true} /> Exibir no site</label>
        <div className="galeria-acoes"><button type="submit">{salvando ? 'Salvando...' : 'Salvar foto'}</button>{editada && <button type="button" onClick={limpar}>Cancelar edição</button>}</div>
      </fieldset>
    </form>
    {carregando ? <p>Carregando fotos...</p> : !fotos.length && <p>A galeria ainda não tem fotos. Adicione a primeira acima.</p>}
    <div className="galeria-admin-fotos">{fotos.map((foto) => <article key={foto.id}><img src={foto.imagem} alt={`Foto de bolo #${foto.id}`} /><div><b>Foto #{foto.id}</b><small>Ordem {foto.ordem} · {foto.ativo ? 'Visível' : 'Oculta'}</small><div className="galeria-acoes"><button disabled={salvando} onClick={() => { setEditada(foto); setArquivo(null); setPrevia('') }}>Editar</button><button disabled={salvando} onClick={() => remover(foto)}>Remover</button></div></div></article>)}</div>
  </div>
}
