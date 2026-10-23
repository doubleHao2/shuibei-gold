/**
 * Vercel Serverless Function: /api/gold-price
 * 
 * 作用：当 GitHub 恢复后将仓库连接到 Vercel 时，Vercel 会自动将本文件部署为
 * 零配置的 Serverless 接口。
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持 GET 请求' });
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
      return res.status(502).json({ error: `新浪行情服务返回 HTTP ${sinaRes.status}` });
    }

    const buffer = await sinaRes.arrayBuffer();
    const text = new TextDecoder('gb18030').decode(buffer);
    const match = text.match(/var\s+hq_str_gds_AU9999\s*=\s*"([^"]*)"/);

    if (!match || !match[1]) {
      return res.status(502).json({ error: '新浪行情响应中没有 gds_AU9999 数据' });
    }

    const fields = match[1].split(',');
    const price = Number(fields[0]);
    const time = fields[6];
    const prevClose = Number(fields[7]);
    const date = fields[12];

    if (!Number.isFinite(price) || price <= 0 || !time || !date) {
      return res.status(502).json({ error: '新浪 Au99.99 行情字段格式无效' });
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
      source: '新浪财经 gds_AU9999 (Vercel Serverless)'
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(payload);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? '新浪行情请求超时' : (err.message || '获取新浪行情失败')
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
