/**
 * Cloudflare Pages Advanced Mode: _worker.js
 * 
 * 作用：支持 Cloudflare Pages 网页端拖拽上传（Direct Upload）以及 Wrangler 部署。
 * 在构建输出目录 dist/ 中包含此文件时，Cloudflare Pages 边缘节点会自动拦截 /api/gold-price，
 * 并代理解析新浪黄金实时行情（带 CORS 头与 GB18030 转码），其余静态页面请求透明回源。
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 拦截 /api/gold-price 请求
    if (url.pathname === '/api/gold-price') {
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: '只支持 GET 请求' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const sinaRes = await fetch('https://hq.sinajs.cn/list=gds_AU9999', {
          signal: controller.signal,
          headers: {
            'Accept': 'text/javascript, */*; q=0.01',
            'Referer': 'https://finance.sina.com.cn/'
          }
        });

        if (!sinaRes.ok) {
          return new Response(JSON.stringify({ error: `新浪行情服务返回 HTTP ${sinaRes.status}` }), {
            status: 502,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const buffer = await sinaRes.arrayBuffer();
        // Cloudflare Workers 运行时原生支持 WHATWG 标准编码（含 gb18030 / gbk）
        const text = new TextDecoder('gb18030').decode(buffer);
        const match = text.match(/var\s+hq_str_gds_AU9999\s*=\s*"([^"]*)"/);

        if (!match || !match[1]) {
          return new Response(JSON.stringify({ error: '新浪行情响应中没有 gds_AU9999 数据' }), {
            status: 502,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const fields = match[1].split(',');
        const price = Number(fields[0]);
        const time = fields[6];
        const prevClose = Number(fields[7]);
        const date = fields[12];

        if (!Number.isFinite(price) || price <= 0 || !time || !date) {
          return new Response(JSON.stringify({ error: '新浪 Au99.99 行情字段格式无效' }), {
            status: 502,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const updatedAt = new Date(`${date}T${time}+08:00`);
        const changePercent = Number.isFinite(prevClose) && prevClose > 0
          ? Number((((price - prevClose) / prevClose) * 100).toFixed(2))
          : null;

        const payload = {
          symbol: 'Au99.99',
          market: '上海黄金交易所',
          price,
          unit: 'CNY/g',
          changePercent,
          updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date().toISOString() : updatedAt.toISOString(),
          source: '新浪财经 gds_AU9999 (Cloudflare Pages)'
        };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        const isTimeout = err.name === 'AbortError';
        return new Response(JSON.stringify({ error: isTimeout ? '新浪行情请求超时' : (err.message || '获取新浪行情失败') }), {
          status: isTimeout ? 504 : 502,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 对 favicon.ico 做保底响应，避免控制台报错 404
    if (url.pathname === '/favicon.ico') {
      if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status !== 404) return assetRes;
      }
      return new Response(null, { status: 204 });
    }

    // 其他所有静态资源请求交给 Cloudflare Pages / Workers 静态资产管理器
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Asset not found', { status: 404 });
  }
};
