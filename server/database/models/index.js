const { Sequelize } = require('sequelize');
const sequelize = require('../connectors/postgres');

// Import models
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');

// Initialize models
const models = {
  Transaction: Transaction(sequelize),
  AuditLog: AuditLog(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add sequelize instance and models to export
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;