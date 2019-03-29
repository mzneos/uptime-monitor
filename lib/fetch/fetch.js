const fetchData = require('./fetchData');
const insertMetrics = require('./storeData');
const config = require('../config/config');

const monitorHost = async (host) => {
    try {
        const metrics = await fetchData(host);

        await insertMetrics(metrics);
    } catch (err) {
        console.log(err);
    }
};

// Monitor the host every config.fetch.intervalTime (in milliseconds)
setInterval(() => {
    monitorHost(config.fetch.monitoredUrl);
}, config.fetch.intervalTime);
