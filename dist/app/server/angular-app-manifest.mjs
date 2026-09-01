
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
      "chunk-U7DV2C7L.js",
      "chunk-LFEYSS2I.js",
      "chunk-T6WJT3NI.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-Y7OFE6XD.js",
      "chunk-T6WJT3NI.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-ITD7M2YW.js",
      "chunk-T6WJT3NI.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-6MLUV4HZ.js",
      "chunk-LFEYSS2I.js",
      "chunk-T6WJT3NI.js"
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
    'index.csr.html': {size: 31138, hash: 'fa2f766fad10fbb50f553a4a30609fe1e6237e554454ef29a51833311b33c088', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '9c0842c2ad06f076b39cf6c0a48a394df8e14aec365b64a2ab5cc86c698c22c0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'beneficiarios/index.html': {size: 65514, hash: '98e50112803d2706c004bdaa514e42a55cdbaa98e5b81fd41a87220d09f178ba', text: () => import('./assets-chunks/beneficiarios_index_html.mjs').then(m => m.default)},
    'confirmados/index.html': {size: 73666, hash: '32969ba4600b1715013362f625dc4e67dc936e57ad8a1b95617b2c0a1e61b197', text: () => import('./assets-chunks/confirmados_index_html.mjs').then(m => m.default)},
    'entregas/index.html': {size: 72087, hash: 'cec2b1b4b845265b1951bb444419a2d266dd3d3ca8d6988a02515e062ffe45c5', text: () => import('./assets-chunks/entregas_index_html.mjs').then(m => m.default)},
    'google-forms/index.html': {size: 88547, hash: '846c8bc2c0db21cc73939490d7cbf9f866829ff2daf52f4a99787081aea02fa1', text: () => import('./assets-chunks/google-forms_index_html.mjs').then(m => m.default)},
    'styles-EZH2HO3A.css': {size: 61474, hash: 'huLfZIWmI3c', text: () => import('./assets-chunks/styles-EZH2HO3A_css.mjs').then(m => m.default)}
  },
};
