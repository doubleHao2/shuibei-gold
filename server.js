import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createServer as createViteServer } from 'vite';

const isProduction = process.argv.includes('production');
const PORT = Number(process.env.PORT || 4173);
const ROOT = process.cwd();
const SINA_URL = 'https://hq.sinajs.cn/list=gds_AU9999';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

function parseSinaQuote(raw) {
  const match = raw.match(/var\s+hq_str_gds_AU9999\s*=\s*"([^"]*)"/);
  if (!match?.[1]) throw new Error('新浪行情响应中没有 gds_AU9999 数据');

  const fields = match[1].split(',');
  // 新浪 gds_AU9999 格式：现价,涨跌额,买价,卖价,最高,最低,时间,昨收,今开,...,日期,名称
  const price = Number(fields[0]);
  const time = fields[6];
  const previousClose = Number(fields[7]);
  const tradeDate = fields[12];
  if (!Number.isFinite(price) || price <= 0 || !/^\d{2}:\d{2}:\d{2}$/.test(time || '') || !/^\d{4}-\d{2}-\d{2}$/.test(tradeDate || '')) {
    throw new Error('新浪 Au99.99 行情字段格式无效');
  }

  const updatedAt = new Date(`${tradeDate}T${time}+08:00`);
  if (Number.isNaN(updatedAt.getTime())) throw new Error('新浪行情时间格式无效');
  const changePercent = Number.isFinite(previousClose) && previousClose > 0
    ? ((price - previousClose) / previousClose) * 100
    : null;

  return {
    symbol: 'Au99.99',
    market: '上海黄金交易所',
    price,
    unit: 'CNY/g',
    changePercent: changePercent === null ? null : Number(changePercent.toFixed(2)),
    updatedAt: updatedAt.toISOString(),
    source: '新浪财经 gds_AU9999'
  };
}

async function getGoldPrice() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(SINA_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'text/javascript, */*; q=0.01',
        Referer: 'https://finance.sina.com.cn/'
      }
    });
    if (!response.ok) throw new Error(`新浪行情服务返回 HTTP ${response.status}`);

    // 新浪响应声明 GB18030 编码，不能使用 response.text() 误按 UTF-8 解码。
    const bytes = new Uint8Array(await response.arrayBuffer());
    const raw = new TextDecoder('gb18030').decode(bytes);
    return parseSinaQuote(raw);
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('新浪行情请求超时，请稍后重试');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const distRoot = resolve(ROOT, 'dist');
  const candidate = resolve(distRoot, `.${requestPath === '/' ? '/index.html' : requestPath}`);
  if (candidate !== distRoot && !candidate.startsWith(`${distRoot}${sep}`)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(candidate);
    if (!fileStat.isFile()) throw new Error('Not a file');
    const content = await readFile(candidate);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extname(candidate)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(content);
  } catch {
    if (requestPath.includes('.')) {
      res.writeHead(404).end('Not found');
      return;
    }
    try {
      const html = await readFile(resolve(distRoot, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      res.end(html);
    } catch {
      res.writeHead(503).end('Build the app first with npm run build.');
    }
  }
}

const vite = isProduction ? null : await createViteServer({
  configFile: resolve(ROOT, 'vite.config.js'),
  server: { middlewareMode: true },
  appType: 'spa'
});

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/api/gold-price') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: '只支持 GET 请求' });
      return;
    }
    try {
      sendJson(res, 200, await getGoldPrice());
    } catch (error) {
      sendJson(res, error.name === 'AbortError' ? 504 : 502, { error: error.message || '获取新浪行情失败' });
    }
    return;
  }

  if (vite) {
    vite.middlewares(req, res, (error) => {
      if (error) {
        res.writeHead(500).end('Development server error');
        return;
      }
      res.writeHead(404).end('Not found');
    });
    return;
  }
  await serveStatic(req, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Gold calculator ${isProduction ? 'server' : 'dev server'} listening on http://127.0.0.1:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close();
    if (vite) await vite.close();
  });
}
