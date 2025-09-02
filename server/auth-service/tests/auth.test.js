const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

describe('Auth Service', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create test user
      const user = new User({
        username: 'testuser',
        password: '$2a$12$K9Qc8z8qZ8Z8Z8Z8Z8Z8Z.Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // password123
        name: 'Test User',
        email: 'test@example.com'
      });
      await user.save();

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          password: 'Password123',
          name: 'New User',
          email: 'newuser@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('newuser');
    });

    it('should fail with duplicate username', async () => {
      // Create existing user
      const user = new User({
        username: 'existinguser',
        password: 'hashedpassword',
        name: 'Existing User',
        email: 'existing@example.com'
      });
      await user.save();

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password123',
          name: 'Another User',
          email: 'another@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
  });
});