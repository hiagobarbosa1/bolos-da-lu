const desenhos = {
  produto: 'M4 12h16v9H4z M4 15q2 3 4 0q2 3 4 0q2 3 4 0q2 3 4 0 M6 12V9h12v3 M9 9V6m6 3V6 M9 3v1m6-1v1',
  tamanho: 'M4 14v6h6 M4 20l6-6 M14 4h6v6 M20 4l-6 6',
  sabor: 'M5 12h14l-2 9H7z M5 12a3 3 0 0 1 0-6a4 4 0 0 1 8-1a4 4 0 0 1 6 7',
  recheio: 'M3 11h18c0 7-4 10-9 10S3 18 3 11z M3 11c0-3 18-3 18 0 M13 10l6-7q3-2 2 1l-4 7',
  cobertura: 'M3 10c0-10 18-10 18 0v4q-3 2-3-2v-1q-3-4-4 1v7q-2 4-4 0v-6q-1-5-4-2v3q-3 2-3-1z',
  decoracao: 'M12 8C6-4 2 8 8 10C-4 10 3 21 9 15C7 27 20 23 15 15C26 22 27 9 16 10C24 1 10-3 12 8z M14 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0',
  data: 'M4 5h16v16H4z M4 10h16 M8 3v4m8-4v4',
  observacao: 'M5 3h10l4 4v14H5z M14 3v5h5 M9 12h6m-6 4h4',
  imagem: 'M4 4h16v16H4z M4 17l5-5 4 4 3-3 4 4 M10 8a1 1 0 1 1-2 0a1 1 0 1 1 2 0',
  camera: 'M3 7h5l2-3h4l2 3h5v13H3z M16 13a4 4 0 1 1-8 0a4 4 0 1 1 8 0',
  upload: 'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',
}

export default function IconeEncomenda({ tipo }) {
  return <svg className="icone-encomenda" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={desenhos[tipo]} /></svg>
}
