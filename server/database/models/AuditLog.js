const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mpesa_transactions',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performed_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    performed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'transaction_audit_log',
    timestamps: false,
    indexes: [
      {
        fields: ['transaction_id']
      },
      {
        fields: ['performed_at']
      },
      {
        fields: ['action']
      }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.Transaction, {
      foreignKey: 'transaction_id',
      as: 'transaction'
    });
  };

  return AuditLog;
};