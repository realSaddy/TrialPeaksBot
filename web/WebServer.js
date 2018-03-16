const http = require('http');
  
const server = http.createServer((req, res) => {
  res.writeHead(200);
}).listen(3000);

console.log("WebServer is online!");

setInterval(() => {
  http.get(`http://${process.env.GLITCH_PROJECT_NAME}.glitch.me/`);
}, 280000);