const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 8000;

// Set target strictly to the origin S3 domain (no subpaths)
const S3_TARGET = 'https://ricky-deploy-x.s3.eu-north-1.amazonaws.com';

const proxy = httpProxy.createProxy();

// Prevent process crashes on network connection resets
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err.message);
    if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway: Could not connect to upstream S3 bucket.');
    }
});

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    // Default root requests to index.html
    let requestPath = req.url;
    if (requestPath === '/') {
        requestPath = '/index.html';
    }

    // Rewrite req.url to point directly to the object key in S3
    req.url = `/__outputs/${subdomain}${requestPath}`;

    return proxy.web(req, res, { 
        target: S3_TARGET, 
        changeOrigin: true 
    });
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`));