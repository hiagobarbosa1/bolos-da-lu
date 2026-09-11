import { useState } from 'react'

const depoimentos = [
  ['Camila Santoro', 'O bolo de red velvet é simplesmente perfeito! A massa é super fofinha e o recheio não é enjoativo. Sem contar que a loja parece um cenário de filme, dá vontade de morar lá dentro.', 'Red velvet'],
  ['Lucas Moreira', 'Fiz o pedido de um bolo decorado para o aniversário da minha noiva e superou todas as expectativas. A apresentação é impecável e o sabor de ninho com morango estava surreal. Com certeza faremos mais encomendas!', 'Encomenda personalizada'],
  ['Mariana Paes', 'Os macarons e as fatias de torta de limão são os melhores que já provei. O atendimento no salão é impecável e a experiência de tomar um café naquele espaço lindo faz todo o valor valer a pena.', 'Uma pausa doce'],
  ['Beatriz & Thiago', 'Compramos uma caixa de doces variados para um evento em família e não sobrou nem um para contar história. O capricho na embalagem e no acabamento de cada docinho mostra o amor no trabalho da Lu.', 'Momentos em família'],
  ['Juliana Prado', 'Comprei o bolo de cenoura com cobertura de brigadeiro belga para o café da tarde e virou o favorito de casa! Dá para sentir a qualidade dos ingredientes em cada pedaço, é puro aconchego.', 'Café da tarde'],
  ['Fernando Costa', 'Espaço lindo demais, mas o verdadeiro destaque são os doces. O éclair de pistache é espetacular e o café expresso vem na temperatura ideal. Excelente para reuniões rápidas ou um momento de pausa.', 'Nosso espaço'],
  ['Renata Silveira', 'A encomenda para o mesversário da minha filha chegou impecável e no horário certinho. Além de lindo por fora, o bolo de doce de leite com nozes estava molhadinho e incrível. Nota 10!', 'Uma data especial'],
  ['Gabriel Mendes', 'Lugar encantador e doces de altíssimo nível. A fatia de bolo de morango com chantilly fresco derrete na boca. Vale cada centavo pela experiência completa.', 'Sabores que encantam'],
]

export default function DepoimentosLoja() {
  const [pagina, setPagina] = useState(0)
  const paginas = Math.ceil(depoimentos.length / 3)
  return <div className="depoimentos-loja">
    <p className="depoimentos-origem">Relatos compartilhados pela loja</p>
    <div className="depoimentos-vitrine">
      <div className="avaliacoes-grade">{depoimentos.slice(pagina * 3, pagina * 3 + 3).map(([nome, texto, tema]) => <article className="avaliacao-card depoimento-card" key={nome}>
        <span className="depoimento-aspas" aria-hidden="true">“</span>
        <strong>{nome}</strong>
        <blockquote>{texto}</blockquote>
        <span className="depoimento-tema"><span aria-hidden="true">♡</span> {tema}</span>
      </article>)}</div>
    </div>
    <div className="depoimentos-navegacao">
      <button type="button" aria-label="Comentários anteriores" onClick={() => setPagina((valor) => (valor - 1 + paginas) % paginas)}>←</button>
      <div>{Array.from({ length: paginas }, (_, indice) => <button type="button" className="depoimentos-ponto" key={indice} aria-label={`Página ${indice + 1} de comentários`} aria-current={pagina === indice ? 'page' : undefined} onClick={() => setPagina(indice)} />)}</div>
      <button type="button" aria-label="Próximos comentários" onClick={() => setPagina((valor) => (valor + 1) % paginas)}>→</button>
      <span className="depoimentos-pagina" aria-live="polite">{pagina + 1} / {paginas}</span>
    </div>
  </div>
}
