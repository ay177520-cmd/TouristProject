const express = require("express");

const app = express();

app.get("/test", (req, res) => {
    res.send("TEST OK");
});

app.listen(3002, "127.0.0.1", () => {
    console.log("Test server running on port 3002");
});