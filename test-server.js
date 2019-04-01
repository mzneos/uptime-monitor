/*
*   Testing server for the alert logic
*/

const http = require('http');

const testServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello there !');
    res.end();
});

testServer.listen(8080);
