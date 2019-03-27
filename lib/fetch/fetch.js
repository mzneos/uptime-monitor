const fetchData = require('./fetchData');
const config = require('../config/config');

fetchData(config.fetch.monitoredUrl).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});

fetchData(config.fetch.monitoredUrl).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});
