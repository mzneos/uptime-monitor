const https = require('https');

const config = require('../config/config');

const fetchData = () => new Promise((resolve) => {
    // timings store the starting times of the https request steps
    const timings = {
        startAt: process.hrtime(),
        dnsLookupAt: undefined,
        tcpConnectionAt: undefined,
        tlsHandshakeAt: undefined,
        firstByteAt: undefined,
        endAt: undefined,
    };

    // https request : events allow the storage of the different timings
    const req = https.request(config.fetch.monitoredUrl, (res) => {
        res.once('readable', () => {
            timings.firstByteAt = process.hrtime();
        });
        res.on('data', () => { });
        res.on('end', () => {
            timings.endAt = process.hrtime();

            resolve(timings); // Resolve timing dictionary for future use
        });
    }).end();

    req.on('socket', (socket) => {
        socket.on('lookup', () => {
            timings.dnsLookupAt = process.hrtime();
        });
        socket.on('connect', () => {
            timings.tcpConnectionAt = process.hrtime();
        });
        socket.on('secureConnect', () => {
            timings.tlsHandshakeAt = process.hrtime();
        });
    });
});

module.exports = fetchData;
