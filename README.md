# ssl-node-example
A simple example of how to use HTTPS with NodeJS.


## Dependancies 
1) https
2) express

* Let's first add our dependncies.
`
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
`
Above we have added 4 libraries, 2 are dependacies, 2 come with NodeJs.
https to handle our secure server. fs, to read files, constants for NodeJs contants, and finally express. 
This example doesn't add any middleware for cors, or body parser. You can do that on your own later.

Next we add our routes to the server. Here I just use the default landing url and I return a nice "Hello World" message.
`
server.get('/',(req, res, next)=>{res.send('<h1>Hello World</h1>')})
`
* Time to get Secure.
`
let privateKeyFile = undefined;
if(fs.existsSync(Config.privateKey))
    privateKeyFile = fs.readFileSync(Config.privateKey, 'utf8');
`
The above code loads our private key from our file, set in our config. 

`
let certificateFile = undefined;
if(fs.existsSync(Config.certificate))
    certificateFile = fs.readFileSync(Config.certificate, 'utf8');
`
The above code loads our certificate frin our file, set in our config. 

`
let caBundleFile = undefined;
if(fs.existsSync(Config.ca_bundle))
    caBundleFile = fs.readFileSync(Config.ca_bundle, 'utf8');
`
The above code loads our Bundle Certificate from our file, set in our config. 

`
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
`
Finally we set our expression to run the secure server if all our security files load, otherwise it loads the http standard server.
