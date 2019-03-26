const https = require('https');

const config = require('../config/config');

/* Computes the duration between two timings returned by process.hrtime() */
const getDuration = (startTime, endTime) => {
    let duration = endTime[0] * (10 ** 3) - startTime[0] * (10 ** 3);
    duration += (endTime[1] - startTime[1]) / (10 ** 6);

    return Math.floor(duration);
};

/* Get the responses times for each step of the HTTPS timeline */
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

    const responseTimes = {
        dnsLookup: undefined,
        tcpConnection: undefined,
        tlsHandshake: undefined,
        firstByte: undefined,
        transfer: undefined,
        total: undefined,
    };

    // https request : events allow the storage of the different timings
    const req = https.request(config.fetch.monitoredUrl, (res) => {
        res.once('readable', () => {
            timings.firstByteAt = process.hrtime();
            responseTimes.firstByte = getDuration((timings.tlsHandshakeAt || timings.tcpConnectionAt),
                timings.firstByteAt);
        });
        res.on('data', () => { });
        res.on('end', () => {
            timings.endAt = process.hrtime();
            responseTimes.transfer = getDuration(timings.firstByteAt, timings.endAt);
            responseTimes.total = getDuration(timings.startAt, timings.endAt);

            resolve(responseTimes); // Resolve responseTimes dictionary
        });
    }).end();

    req.on('socket', (socket) => {
        socket.on('lookup', () => {
            timings.dnsLookupAt = process.hrtime();
            responseTimes.dnsLookup = getDuration(timings.startAt, timings.dnsLookupAt);
        });
        socket.on('connect', () => {
            timings.tcpConnectionAt = process.hrtime();
            responseTimes.tcpConnection = getDuration((timings.dnsLookupAt || timings.startAt),
                timings.tcpConnectionAt);
        });
        socket.on('secureConnect', () => {
            timings.tlsHandshakeAt = process.hrtime();
            responseTimes.tlsHandshake = getDuration(timings.tcpConnectionAt,
                timings.tlsHandshakeAt);
        });
    });
});

module.exports = fetchData;