const fetchData = require('./fetchData');

fetchData().then((responseTimes) => {
    console.log(responseTimes);
}).catch((err) => {
    console.log(err);
});
