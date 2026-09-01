
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
      "chunk-6SXKAKPF.js",
      "chunk-VKWXHBT2.js",
      "chunk-YSMGMTGV.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7L7M2ALL.js",
      "chunk-YSMGMTGV.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-C7ZBHATR.js",
      "chunk-YSMGMTGV.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-EN2LEJF4.js",
      "chunk-VKWXHBT2.js",
      "chunk-YSMGMTGV.js"
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
    'index.csr.html': {size: 31220, hash: 'e5801653f720e5bb83720bd4ea3decf5e09663ce3cb004f87e09ecafe332248e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '920c90eefbe29e00d427067057336eab7bd2bab7713445f84d776d0269c32f77', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 78320, hash: '00afd2ca74dba7429a723966d675309ba3ac9e76daea33a53c8455b0ab741c42', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 70595, hash: 'f406c402bf069683caf6a8836862d0f9105659c78c58b630811938ae8155b5a7', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 65598, hash: '1a4f874aaf90adf7dd0d1d8a3f0962fd05dc8cd1b5d5eae22304fe5b336b702d', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 88631, hash: 'f5375f7d7e6ec18f0ca5de3260f44c25be8806f1f0adc327d0b2c23a4170b0a1', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'styles-V6MJI5SO.css': {size: 62333, hash: 'wPkuUFvny8w', text: () => import('./assets-chunks/styles-V6MJI5SO_css.mjs').then(m => m.default)}
  },
};
