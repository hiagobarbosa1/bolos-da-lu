import { useEffect, useState } from 'react'

function FotoFormato({ formato, imagem }) {
  const [previa, setPrevia] = useState('')
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])
  return <label className="imagem-upload-produto">Foto do bolo {formato}
    <input type="file" name={`imagem_${formato}_arquivo`} accept="image/jpeg,image/png,image/webp" required={!imagem} onChange={(evento) => { const arquivo = evento.target.files?.[0]; setPrevia(arquivo ? URL.createObjectURL(arquivo) : '') }} />
    <span>JPG, PNG ou WEBP, até 5 MB.</span>
    {(previa || imagem) && <img src={previa || imagem} alt={`Prévia do bolo ${formato}`} />}
  </label>
}

export default function ImagensBolo({ produto }) {
  return <><FotoFormato formato="redondo" imagem={produto.imagem_redondo || produto.imagem} /><FotoFormato formato="retangular" imagem={produto.imagem_retangular} /></>
}
