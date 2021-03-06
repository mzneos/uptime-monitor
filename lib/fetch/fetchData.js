/*
*   Make an https request to a specified url
*   Return the response times and status code
*/

const http = require('http');
const https = require('https');
const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/fetch.log');

/* Computes the duration between two timings returned by process.hrtime() */
const getDuration = (startTime, endTime) => {
    let duration = endTime[0] * (10 ** 3) - startTime[0] * (10 ** 3);
    duration += (endTime[1] - startTime[1]) / (10 ** 6);

    return Math.floor(duration);
};

/* Get the responses times for each step of the HTTPS timeline */
const fetchData = async url => new Promise((resolve) => {
    // timings store the starting times of the https request steps
    const timings = {
        startAt: process.hrtime(),
        dnsLookupAt: undefined,
        tcpConnectionAt: undefined,
        tlsHandshakeAt: undefined,
        firstByteAt: undefined,
        endAt: undefined,
    };

    // fetchedData : object to store responseTimes and statusCode
    const fetchedData = {
        time: new Date(),
        host: url,
        responseTimes: {
            dnsLookup: undefined,
            tcpConnection: undefined,
            tlsHandshake: undefined,
            firstByte: undefined,
            transfer: undefined,
            total: undefined,
        },
        statusCode: undefined,
    };

    // http or https request : events allow the storage of the different timings
    const req = ((url.lastIndexOf('https') === 0) ? https : http).request(url, (res) => {
        res.once('readable', () => {
            timings.firstByteAt = process.hrtime();
            fetchedData.responseTimes.firstByte = getDuration((timings.tlsHandshakeAt || timings.tcpConnectionAt),
                timings.firstByteAt);
        });
        res.on('data', () => { });
        res.on('end', () => {
            timings.endAt = process.hrtime();
            fetchedData.responseTimes.transfer = getDuration(timings.firstByteAt, timings.endAt);
            fetchedData.responseTimes.total = getDuration(timings.startAt, timings.endAt);

            fetchedData.statusCode = res.statusCode;

            resolve(fetchedData); // Resolve responseTimes dictionary
        });
    }).on('error', (err) => {
        log.error(`Unable to fetch data from host ${url}`);
        log.error(err);

        resolve(fetchedData);
    }).end();

    req.on('socket', (socket) => {
        socket.on('lookup', () => {
            timings.dnsLookupAt = process.hrtime();
            fetchedData.responseTimes.dnsLookup = getDuration(timings.startAt, timings.dnsLookupAt);
        });
        socket.on('connect', () => {
            timings.tcpConnectionAt = process.hrtime();
            fetchedData.responseTimes.tcpConnection = getDuration((timings.dnsLookupAt || timings.startAt),
                timings.tcpConnectionAt);
        });
        socket.on('secureConnect', () => {
            timings.tlsHandshakeAt = process.hrtime();
            fetchedData.responseTimes.tlsHandshake = getDuration(timings.tcpConnectionAt,
                timings.tlsHandshakeAt);
        });
    });
});

module.exports = fetchData;
