require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'auth-service-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  },
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/sap-mpesa-auth'
  }
};