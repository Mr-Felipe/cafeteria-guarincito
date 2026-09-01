
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
      "chunk-VEUIUXN6.js",
      "chunk-GQ5GXLD2.js",
      "chunk-DRPLKR4H.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-FTBRROIB.js",
      "chunk-DRPLKR4H.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-EKZGOMFD.js",
      "chunk-DRPLKR4H.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-NEYMGCYU.js",
      "chunk-GQ5GXLD2.js",
      "chunk-DRPLKR4H.js"
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
    'index.csr.html': {size: 30133, hash: 'e6c1060ce65bc8cc9c786424a871c8721c3ec48899e40def65347f17a3d70200', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '14b9b935bb295c189b3806f6bbe731aef6c2ddfb38f822863eabbd11d2e069b9', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 64486, hash: '877071bfd7cd79ea2c38edc829d580a8b97dfdeb0a664a8c77550290bc0f19df', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 71059, hash: '01961d83e1e671b3d5fda29fde3d7a952b6ea124cfac236e08f562385cfea48b', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 72638, hash: 'da44854d0ac4862d3a04392c749ecc379fa51a8c134dc8ebd4cd98b5f1ca4ffc', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 87519, hash: 'ba8ff932e272e189ffd89bb0a1f97648bfad181ddb51ec6f8fc22771e1f84a9a', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'styles-NRWRCQBX.css': {size: 59073, hash: '63DKZxwZxRc', text: () => import('./assets-chunks/styles-NRWRCQBX_css.mjs').then(m => m.default)}
  },
};
