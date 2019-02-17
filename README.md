# _SSL With ExpressJS and HTTPS_

### What you will need.

1. A Domain to secure

   1.a) Access to set a DNS record

2. NodeJs Installed

To start we will get our certificates.

    For this example I use : https://www.sslforfree.com/

> It's free, and will work for our purposes.

## _Let's Get Started_

> 1. Enter your domain name, and click "Create Free SSL Certificate"

> 2. For the next step in this example we will choose the "Manual Verification (DNS)"

You can follow the direction on the page, or simple create two dns records
where the host name is `_acme-challenge` and `_acme-challenge.www`
The values will be supplied by sslforfree.com enter those and set your time to live
to the lowest value.

## _Now comes the waiting game._

Depending on the DNS providor, will depends how quick this will filter through to be live. Once you click Verify on each of the records, they should show the value of the text on the page. If not wait until the time you set to live has passed and check again.

Once you see the text load your values are live. Now you can go back to the other page and click Download SSL Certificates.

    dont check the "I have My Own CSR" unless you know what you are doing.

Once you have downloaded the certificate, bundle, and private key we can setup express to use them.

## _Setting up express to use our new certificates._

lets start by getting our project started

1. Create a folder for our new project.

2. Inside the new project folder, lets `npm init` and create our package.json file.

3. Once that is complete lets add our dependancies.

   3.a) `npm i express cors body-parser --save`

This will get the basics installed.

## _Add the Certificates to our project folder._

Take the downloaded files and extract them to a folder in the project folder, lets use the name ssl for consistency, you can put these anywhere you like later, just make sure
to set the correct path in the server.

After we complete that we can create our index.js file in our project folder and start adding our base logic for the server.

```JavaScript
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const constants = require('constants');
```

These are our basics requirements, we have our file and path operations. We have express to run the server, and https for our secure layer. We have cors, and bodyParser as common middleware. Finally we have constants which containt some common constants we need.

```JavaScript
const Config = {
  host: "::",
  port: "443",
  whitelist: ["www.domain.com", "domain.com", "localhost"],
  certificate: "ssl/certificate.crt",
  ca_bundle: "ssl/ca_bundle.crt",
  privateKey: "ssl/private.key"
}
```

In out `Config` we setup our variables, usually this would be a file that we include for now we will just code it here.

In the following code we build our whitelist event so that we can enable cors for your project, and deny others from access where appropriate.

```JavaScript
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
```

Now that we have a whitelist cors delegation function we can add our cors and body parser middleware after we instantiate our server variable.

```JavaScript
const server = express();
server.use(cors(corsOptionsDelegate), bodyParser.json());
```

After we have our middleware we can create our routes. We will just create one in the example.

```JavaScript
server.get('/',(r,s,n)=>{
    s.send('Hello World!');
})
```

Using the default route the server would simple deliver `Hello World!` to the client.

Time to load our certificate file.

```JavaScript
let certificateFile = undefined;
if (fs.existsSync(Config.certificate))
  certificateFile = fs.readFileSync(Config.certificate, "utf8");
```

We now load the bundle file.

```JavaScript
let caBundleFile = undefined;
if (fs.existsSync(Config.ca_bundle))
  caBundleFile = fs.readFileSync(Config.ca_bundle, "utf8");
```

Finally we load our key file.

```JavaScript
let privateKeyFile = undefined;
if (fs.existsSync(Config.privateKey))
  privateKeyFile = fs.readFileSync(Config.privateKey, "utf8");
```

In the following logic, we are simply checking to make sure everything loaded so that we can start the secure server, if something is missing, it should start the normal server.

```JavaScript
if (privateKeyFile && certificateFile && caBundleFile) {
  //here we setup our credentials for the https server
  const credentials = {
    cert: certificateFile,
    ca: caBundleFile,
    key: privateKeyFile,
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
  };
  Config.port = '443';
  //We create the server layer with the new credentials using our application server.
  const httpsServer = https.createServer(credentials, server);
  //finally we start listening to connections on our new secure server.
  const serverHttpsApp = httpsServer.listen(Config.port, Config.host, () => {
    console.log(
      "Secure Server listening on : \n\t" +
        serverHttpsApp.address().address +
        ":" +
        serverHttpsApp.address().port
    );
  });
} else {
  // Something must not have loaded in our security, but we can see if the server will start normally this can help us narrow down any bugs.
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
```

That concludes my tutorial on how to build a secure server use NodeJs, Express, and SSL certificates. If you have any questions or comments I encourage you to reach out to me by email. michaeladennis@yahoo.com!
