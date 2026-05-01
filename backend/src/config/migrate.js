'use strict';

require('dotenv').config();
const sequelize = require('./database');

// Import all models to register them
require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection established.');

    // sync({ force: false }) — safe: creates tables if missing, never drops
    await sequelize.sync({ force: false });
    console.log('✅ Database schema synced.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
