module.exports = {
    fetch: {
        monitoredUrl: 'https://www.datadoghq.com',
        intervalTime: 1000,
    },
    database: {
        host: 'localhost',
        port: 5432,
        database: 'uptime_monitor',
        user: 'postgres',
        password: 'password',
    },
    alerts: {
        timespan: 120000,
        checkInterval: 5000,
    },
};
