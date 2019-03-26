const fetchData = require('./fetchData');

fetchData().then((timings) => {
    console.log(timings);
}).catch((err) => {
    console.log(err);
});
