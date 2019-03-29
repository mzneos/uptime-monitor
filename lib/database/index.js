const pgp = require('pg-promise')();

const config = require('../config/config');

const db = pgp(config.database);

module.exports = db;
