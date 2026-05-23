const https = require('https');

const API_KEY = process.env.PUBG_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path: apiPath } = req.query;
  if (!apiPath) {
    res.status(400).json({ error: 'path required' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryStr = url.search.replace(`?path=${encodeURIComponent(apiPath)}`, '').replace(/^&/, '?');
  const fullPath = '/' + apiPath + queryStr;

  const options = {
    hostname: 'api.pubg.com',
    path: fullPath,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json'
    }
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode).setHeader('Content-Type', 'application/json').end(data);
        resolve();
      });
    });
    proxyReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    proxyReq.end();
  });
};
