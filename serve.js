// Dev-only static file server for local testing (NOT part of the submission zip).
// Usage: node serve.js  →  http://localhost:8642
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// Honour PORT when the harness assigns one; 8642 is the friendly default the
// docs and the /dev redirect examples refer to.
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Convenience: /island.html/dev and /island.html/dev/3 are paths, not query
  // strings, so they would 404. Redirect them to the real hook (?dev, and
  // ?isle=N for a specific isle) so either form of the URL just works.
  const devPath = /^(.*\.html)\/dev(?:\/(\d))?\/?$/.exec(urlPath);
  if (devPath) {
    const isle = devPath[2] ? `&isle=${devPath[2]}` : '';
    res.writeHead(302, { Location: `${devPath[1]}?dev${isle}` });
    res.end();
    return;
  }

  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(Number(process.env.PORT) || 8642, function () {
  console.log('Squnchies dev server → http://localhost:' + this.address().port);
});
