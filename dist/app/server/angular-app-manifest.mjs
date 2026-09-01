
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "redirectTo": "/confirmados",
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-W3XCK52Q.js",
      "chunk-EFPSSUT4.js",
      "chunk-OZ2GCLUF.js"
    ],
    "route": "/confirmados"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LTVEOGGP.js",
      "chunk-OZ2GCLUF.js"
    ],
    "route": "/entregas"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-X34AYTGR.js",
      "chunk-OZ2GCLUF.js"
    ],
    "route": "/beneficiarios"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-S63IFP3P.js",
      "chunk-EFPSSUT4.js",
      "chunk-OZ2GCLUF.js"
    ],
    "route": "/google-forms"
  },
  {
    "renderMode": 1,
    "redirectTo": "/confirmados",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 31220, hash: '145795b7591ed32372d80293bff1d64616227c6bc9187e5919fc8f098b4fd9c4', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16690, hash: '638776be413ff5d59d6878c6a4c3550f98c6c11129baedb4c621b9c078830822', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-V6MJI5SO.css': {size: 62333, hash: 'wPkuUFvny8w', text: () => import('./assets-chunks/styles-V6MJI5SO_css.mjs').then(m => m.default)}
  },
};
