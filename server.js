const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');

const serve = serveStatic('./public');

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res));
});

server.listen(3000, () => {
  console.log('Serving from ./public at http://localhost:3000');
});
