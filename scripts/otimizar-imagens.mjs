import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const pasta = fileURLToPath(new URL('../src/assets/', import.meta.url))
const categorias = new Set(['bolos', 'docinhos', 'copo', 'kit'])
let totalAntes = 0
let totalDepois = 0

// Mantém os originais para permitir ajustes futuros na qualidade.
for (const arquivo of await readdir(pasta)) {
  if (!/\.(png|jpe?g)$/i.test(arquivo) || arquivo.startsWith('logo')) continue
  const nome = path.parse(arquivo).name
  const origem = path.join(pasta, arquivo)
  const destino = path.join(pasta, `${nome}.webp`)
  const largura = categorias.has(nome) ? 720 : nome.includes('mobile') ? 900 : nome.startsWith('banner') ? 1920 : 1000
  const antes = (await stat(origem)).size
  const resultado = await sharp(origem)
    .rotate()
    .resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: nome.startsWith('banner') ? 90 : 85, effort: 6 })
    .toFile(destino)
  totalAntes += antes
  totalDepois += resultado.size
  console.log(`${arquivo}: ${(antes / 1024).toFixed(0)} KB -> ${(resultado.size / 1024).toFixed(0)} KB (${resultado.width}x${resultado.height})`)
}
console.log(`Total: ${(totalAntes / 1e6).toFixed(2)} MB -> ${(totalDepois / 1e6).toFixed(2)} MB; redução de ${(100 * (1 - totalDepois / totalAntes)).toFixed(1)}%.`)
