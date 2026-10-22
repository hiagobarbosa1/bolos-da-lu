import { useEffect, useState } from 'react'

export default function BannersInicio({ banners }) {
  const [bannerAtual, setBannerAtual] = useState(0)
  useEffect(() => {
    const intervalo = window.setInterval(() => {
      if (!document.hidden) setBannerAtual((atual) => (atual + 1) % banners.length)
    }, 3500)
    return () => window.clearInterval(intervalo)
  }, [banners.length])
  function mudarBanner(direcao) {
    setBannerAtual((atual) => (atual + direcao + banners.length) % banners.length)
  }
  return <><div className="carrossel-banner" aria-label="Carrossel de banners da loja"><div className="carrossel-track" style={{ transform: `translateX(-${bannerAtual * 100}%)` }}>{banners.map((banner, index) => <div className="carrossel-slide" key={banner.src}><picture><source media="(max-width: 760px)" srcSet={banner.mobileSrc}/><img src={banner.src} alt={banner.alt} width="1920" height="960" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "low"} decoding="async"/></picture></div>)}</div><button className="carrossel-controle anterior" type="button" onClick={() => mudarBanner(-1)} aria-label="Banner anterior">‹</button><button className="carrossel-controle proximo" type="button" onClick={() => mudarBanner(1)} aria-label="Próximo banner">›</button><div className="carrossel-dots" aria-label="Indicadores do carrossel">{banners.map((banner, index) => <button key={banner.src} type="button" className={`carrossel-dot ${index === bannerAtual ? 'ativo' : ''}`} onClick={() => setBannerAtual(index)} aria-label={`Ir para o banner ${index + 1}`}/>)}</div></div><a className="indicador-rolagem" href="#pronta-entrega" aria-label="Ver doces à pronta entrega"><span>Role para ver</span><b>↓</b></a></>
}
