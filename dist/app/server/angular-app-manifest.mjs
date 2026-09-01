
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/confirmados",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-K3PMUHFF.js",
      "chunk-TDDKXTGK.js",
      "chunk-ANDBK2PW.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-YVXIRNQ2.js",
      "chunk-ANDBK2PW.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-SWQLDPFJ.js",
      "chunk-ANDBK2PW.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-P5YXP5TW.js",
      "chunk-TDDKXTGK.js",
      "chunk-ANDBK2PW.js"
    ],
    "route": "/google-forms"
  },
  {
    "renderMode": 2,
    "redirectTo": "/confirmados",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 31220, hash: '76c89d72cde11cc9afcc7a15d3536bde4347a34897e0b274396e9bb91ef2dd43', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: 'e4b45589d1ef0e2506e7a3a33f4ff6fe2f9e2d604c56634b2564eda0cd6ff117', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 70595, hash: '7a0769a70b58302b328fdbf8fee5c5995e78547055a9c8085005d8e7bcaac994', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 65598, hash: 'bdc9df0285de5075b5f114fa1ae6b0193df9da8ac1b800cc9879ab7186745e24', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 88631, hash: '216cc9d9f6f3eaca0de751a2a18851e33ea4abeab86446a47dc2fcddb7de2f31', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 78320, hash: 'b3e7d04def8e86eb4b9762c2107132641e7e2b8aa6c6e93c06595dc5568a6403', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'styles-V6MJI5SO.css': {size: 62333, hash: 'wPkuUFvny8w', text: () => import('./assets-chunks/styles-V6MJI5SO_css.mjs').then(m => m.default)}
  },
};
