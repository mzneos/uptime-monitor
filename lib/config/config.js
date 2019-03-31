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
    dashboard: {
        checkAlertInterval: 5000,
        checkStatsIntervals: {
            shortPeriod: {
                period: 60000,
                checkInterval: 10000,
            },
            longPeriod: {
                period: 3600000,
                checkInterval: 60000,
            },
        },
    },
};
