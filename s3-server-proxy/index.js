const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 8000;

const BASE_PATH = 'https://ricky-deploy-x.s3.eu-north-1.amazonaws.com/__outputs';

const proxy = httpProxy.createProxy();

// 1. Add error handler to prevent the server from crashing on ECONNRESET
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err.message);
    
    // Gracefully handle the response if headers haven't been sent yet
    if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway: Could not connect to upstream S3 bucket.');
    }
});

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolvesTo = `${BASE_PATH}/${subdomain}`;

    // 2. changeOrigin is properly set here to rewrite the Host header for S3
    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/') {
        proxyReq.path += 'index.html';
    }
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`));