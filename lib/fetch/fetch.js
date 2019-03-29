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

monitorHost(config.fetch.monitoredUrl);
