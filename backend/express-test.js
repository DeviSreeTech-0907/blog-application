const express = require("express");

const app = express();

app.get("/", function (req, res) {
    res.send("Express is working!");
});

app.listen(3001, function () {
    console.log("Express test server running on port 3001");
});