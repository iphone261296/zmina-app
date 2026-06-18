const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.css':  'text/css',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url.split('?')[0];
  if (filePath === './') filePath = './index.html';

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback
        fs.readFile('./index.html', (e2, d2) => {
          if (e2) { res.writeHead(500); res.end('Server error'); return; }
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
          });
          res.end(d2);
        });
      } else {
        res.writeHead(500); res.end('Server error');
      }
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    };

    // Cache static assets
    if (['.png','.svg','.ico','.webp'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else if (ext === '.json') {
      headers['Cache-Control'] = 'public, max-age=3600';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Зміна app running at http://0.0.0.0:${PORT}`);
});
