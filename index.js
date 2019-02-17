const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const constants = require("constants");

const Config = {
  host: "::",
  whitelist: ["www.domain.com", "domain.com", "localhost"],
  certificate: "ssl/certificate.crt",
  ca_bundle: "ssl/ca_bundle.crt",
  privateKey: "ssl/private.key"
};

const corsOptionsDelegate = function(request, callback) {
  let corsOptions;
  if (Config.whitelist.indexOf(request.header("Origin")) !== -1) {
    // reflect (enable) the requested origin in the CORS response
    corsOptions = { origin: true };
  } else {
    // disable CORS for this request
    corsOptions = { origin: false };
  }
  // callback expects two parameters: error and options
  callback(null, corsOptions);
};

const server = express();
server.use(cors(corsOptionsDelegate), bodyParser.json());

server.get("/", (req, res, next) => {
  res.send("<h1>Hello World</h1>");
});

let privateKeyFile = undefined;
if (fs.existsSync(Config.privateKey))
  privateKeyFile = fs.readFileSync(Config.privateKey, "utf8");

let certificateFile = undefined;
if (fs.existsSync(Config.certificate))
  certificateFile = fs.readFileSync(Config.certificate, "utf8");

let caBundleFile = undefined;
if (fs.existsSync(Config.ca_bundle))
  caBundleFile = fs.readFileSync(Config.ca_bundle, "utf8");

if (privateKeyFile && certificateFile && caBundleFile) {
  const credentials = {
    cert: certificateFile,
    ca: caBundleFile,
    key: privateKeyFile,
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
  };
  Config.port = '443';
  const httpsServer = https.createServer(credentials, server);
  const serverHttpsApp = httpsServer.listen(Config.port, Config.host, () => {
    console.log(
      "Secure Server listening on : \n\t" +
        serverHttpsApp.address().address +
        ":" +
        serverHttpsApp.address().port
    );
  });
} else {
  Config.port = '3000';
  const serverApp = server.listen(Config.port, Config.host, () => {
    console.log(
      "Server listening on : \n\t" +
        serverApp.address().address +
        ":" +
        serverApp.address().port
    );
  });
}
