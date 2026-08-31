
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
      "chunk-QDCI2CWM.js",
      "chunk-PXEIYBR2.js",
      "chunk-G72D3QRH.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-444N6MAH.js",
      "chunk-G72D3QRH.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-C6P5ITVS.js",
      "chunk-G72D3QRH.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-YATSWNBK.js",
      "chunk-PXEIYBR2.js",
      "chunk-G72D3QRH.js"
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
    'index.csr.html': {size: 29776, hash: '104bdd2f86bb83d7e1292981eb8c56a91fbaf05affac402bf048bc0d5f2ad4aa', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '1de9c9ed9e28995cb7c37dda3de8206f20fe362166c342771c46b4793baa7cdc', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 72261, hash: 'a5b6a20e1bd4dca8d483608e00c16539a3777bc3ac480dc530261be10ebcd6ca', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 64109, hash: 'd946f03dde2c620f94906d682a64b75cd2a1b627428e6cd8fa218e4379645dc3', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 70682, hash: 'c21139069650ac367c92a21e359157445c392983a44c0457a7549a9876572b20', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 87142, hash: 'dde243c6550734a81287b0c474b7e854158670b8a4869d4ad300ddc97818657f', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'styles-V3NBBY74.css': {size: 56688, hash: 'IWCS43SA+gg', text: () => import('./assets-chunks/styles-V3NBBY74_css.mjs').then(m => m.default)}
  },
};
