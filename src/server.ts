import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());
const angularApp = new AngularNodeAppEngine();

/**
 * Express Rest API endpoints for Cafetería Guarincito.
 * Proxies Google Sheets CSV fetching to bypass browser CORS restrictions.
 */
app.post('/api/fetch-sheet', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL no proporcionada' });
    }

    let fetchUrl = url.trim();
    console.log('[fetch-sheet] URL original:', fetchUrl);

    // Normalizar URLs comunes de Google Sheets a formato CSV exportable
    // Formato publicado: /pubhtml -> /pub?output=csv
    if (fetchUrl.includes('/pubhtml')) {
      fetchUrl = fetchUrl.replace('/pubhtml?', '/pub?output=csv&');
      fetchUrl = fetchUrl.replace('/pubhtml', '/pub?output=csv');
    }
    // Formato edit: /edit#gid=12345 -> /export?format=csv&gid=12345
    else {
      const matchSheet = fetchUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (matchSheet && !fetchUrl.includes('/pub?') && !fetchUrl.includes('/export?')) {
        const sheetId = matchSheet[1];
        const gidMatch = fetchUrl.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      }
    }

    console.log('[fetch-sheet] URL normalizada:', fetchUrl);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'CafeteriaGuarincito/1.0',
        'Accept': 'text/csv, text/plain, */*'
      }
    });

    console.log('[fetch-sheet] Response status:', response.status);

    if (!response.ok) {
      const errText = await response.text().catch(() => 'sin detalle');
      console.log('[fetch-sheet] Error body:', errText.substring(0, 200));
      return res.status(response.status).json({
        error: `Error al obtener la hoja de cálculo: ${response.statusText} (${response.status})`
      });
    }

    const csvText = await response.text();
    console.log('[fetch-sheet] CSV length:', csvText.length);
    return res.json({ success: true, csvText, resolvedUrl: fetchUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.log('[fetch-sheet] Exception:', message);
    return res.status(500).json({
      error: 'No se pudo conectar con la URL de Google Sheets: ' + message
    });
  }
});

/**
 * Proxy to Google Apps Script (avoids CORS from browser)
 */
app.post('/api/apps-script', async (req, res) => {
  try {
    const { url, payload } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL no proporcionada' });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.text();
    return res.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return res.status(500).json({ error: 'Error al conectar con Apps Script: ' + message });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
