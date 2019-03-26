const fetchData = require('./fetchData');

fetchData().then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});

fetchData().then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});
