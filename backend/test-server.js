const http = require("http");

const server = http.createServer(function (req, res) {
    res.end("Test server is working!");
});

server.listen(3001, function () {
    console.log("Test server running at http://localhost:3001");
});