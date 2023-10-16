var express = require("express");
var serveStatic = require("serve-static");

var app = express();

app.use(serveStatic(__dirname, { index: ["index.html"] }));

app.listen(4000, function () {
  console.log("CORS-enabled web server listening on port 4000");
});
