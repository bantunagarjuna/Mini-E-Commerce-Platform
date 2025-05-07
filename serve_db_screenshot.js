const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve the database view HTML file
  const filePath = path.join(__dirname, 'screenshots', 'database_view.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error: ${err.code}`);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open this URL to view the database entries visualization.`);
  console.log(`Take a screenshot of this page and save it as database_entries.png`);
});