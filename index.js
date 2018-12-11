const https = require('https');
const fs = require('fs');
const constants = require('constants');
const express = require('express');
const Config = {
    host : '::',
    port : '8484',//'443'
    privateKey : './ssl/private/private.key',
    certificate : './ssl/certs/certificate.crt',
    ca_bundle : './ssl/certs/ca_bundle.crt',
}

const server = express();
server.get('/',(req, res, next)=>{res.send('<h1>Hello World</h1>')})
let privateKeyFile = undefined;
if(fs.existsSync(Config.privateKey))
    privateKeyFile = fs.readFileSync(Config.privateKey, 'utf8');

let certificateFile = undefined;
if(fs.existsSync(Config.certificate))
    certificateFile = fs.readFileSync(Config.certificate, 'utf8');

let caBundleFile = undefined;
if(fs.existsSync(Config.ca_bundle))
    caBundleFile = fs.readFileSync(Config.ca_bundle, 'utf8');

if(privateKeyFile && certificateFile && caBundleFile) {
    Config.port = '443';
    const credentials = { cert: certificateFile,ca: caBundleFile, key: privateKeyFile, secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2, };
    const httpsServer = https.createServer(credentials, server);
    const serverHttpsApp = httpsServer.listen(Config.port, Config.host, () => {
        console.log('Secure Server listening on : \n\t' + serverHttpsApp.address().address + ':' + serverHttpsApp.address().port);
    });
} else {
    const serverApp = server.listen(Config.port, Config.host, () => {
        console.log('Server listening on : \n\t' + serverApp.address().address + ':' + serverApp.address().port);
    });
}
