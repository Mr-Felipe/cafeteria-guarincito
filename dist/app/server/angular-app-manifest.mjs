
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
      "chunk-KONKKHGE.js",
      "chunk-ELKTJAMI.js",
      "chunk-U3C3YY4L.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-ONN4BGVF.js",
      "chunk-U3C3YY4L.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-HZFUKN22.js",
      "chunk-U3C3YY4L.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-Q52OHCUC.js",
      "chunk-ELKTJAMI.js",
      "chunk-U3C3YY4L.js"
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
    'index.csr.html': {size: 30133, hash: 'a2fc80771c24d8548358b9a05c4c1471218d1a86f2b5cf099d480898a153cb50', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '39f957de60c297980c2407b057e2aab4d4caa7d256742280d9552dda0dc52983', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 71059, hash: '188aad87bf3ce94fb16a12c401115e47086dbe30bb935fbe6f66e05d42add130', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 72638, hash: '649ae17e4bdcde1623ff58e7ae5cbb26f56b6d198a58305796713b25e28bbef0', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 64486, hash: 'cc0c9a3bc10b3aa4a2b56ee1177b650798c77a431e7624cedc25566013e4f860', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 87519, hash: '604f5299056576cde4422274f20c4ed625011baaa3e80049bd3f4d9b94cb6956', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'styles-NRWRCQBX.css': {size: 59073, hash: '63DKZxwZxRc', text: () => import('./assets-chunks/styles-NRWRCQBX_css.mjs').then(m => m.default)}
  },
};
