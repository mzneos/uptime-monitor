const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/fetch.log');

const fetchData = require('./fetchData');
const insertMetrics = require('./storeData');
const config = require('../config/config');

const monitorHost = async (host) => {
    try {
        const metrics = await fetchData(host);

        await insertMetrics(metrics);
    } catch (err) {
        log.error(err);
    }
};

// Monitor each host every config.fetch.intervalTime (in milliseconds)
Object.entries(config.fetch.websites).forEach(([host, checkInterval]) => {
    setInterval(() => {
        monitorHost(host);
    }, checkInterval);
});
