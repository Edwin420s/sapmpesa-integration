const request = require('supertest');
const { Sequelize } = require('sequelize');
const app = require('../index');

// Mock the database
jest.mock('../../database/connectors/postgres', () => {
  return new Sequelize('sqlite::memory:', { logging: false });
});

describe('Transaction Service', () => {
  describe('GET /transactions', () => {
    it('should return transactions with pagination', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /transactions/stats', () => {
    it('should return transaction statistics', async () => {
      const response = await request(app)
        .get('/transactions/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });
  });
});