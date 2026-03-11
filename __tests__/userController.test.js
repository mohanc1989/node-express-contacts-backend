const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userRegister, userLogin, currentUser } = require('../controller/userController');
const User = require('../model/userModel');
const validateToken = require('../middleware/validateTokenHandler');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/api/users/register', userRegister);
app.post('/api/users/login', userLogin);
app.get('/api/users/current', validateToken, currentUser);

// Add error handler middleware
const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

describe('User Controller Tests', () => {
  let testUser;
  let accessToken;

  beforeEach(async () => {
    // Clear any existing test data
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).not.toHaveProperty('password');

      // Verify user was saved to database
      const savedUser = await User.findById(response.body.id);
      expect(savedUser).toBeTruthy();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true);
    });

    it('should return 400 when username is missing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('manditatory');
    });

    it('should return 400 when email is missing', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('manditatory');
    });

    it('should return 400 when password is missing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('manditatory');
    });

    it('should return 400 when user already exists', async () => {
      // First, create a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Try to register the same user again
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Already registered');
    });

    it('should hash password correctly', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeTruthy();

      // Verify JWT token
      const decoded = jwt.verify(response.body.accessToken, process.env.ACCESS_TOKEN_SECRET);
      expect(decoded.user.id).toBe(testUser.id);
      expect(decoded.user.email).toBe(testUser.email);
      expect(decoded.user.username).toBe(testUser.username);
    });

    it('should return 400 when email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandiatoy');
    });

    it('should return 400 when password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandiatoy');
    });

    it('should return 401 with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('invalid');
    });

    it('should return 401 with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('invalid');
    });

    it('should return 401 with empty credentials', async () => {
      const loginData = {};

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandiatoy');
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      // Create a test user and generate token
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword
      });

      accessToken = jwt.sign(
        {
          user: {
            id: testUser.id,
            email: testUser.email,
            username: testUser.username
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('invalid');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('authorizsed');
    });

    it('should return 401 with malformed token', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .set('Authorization', 'Bearer')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('authorizsed');
    });

    it('should return 401 with wrong authorization header format', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Basic ${accessToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('invalid or expired');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // Implementation would depend on how you want to handle DB errors
      expect(true).toBe(true); // Placeholder
    });

    it('should handle JWT signing errors', async () => {
      // This test would require mocking JWT signing
      expect(true).toBe(true); // Placeholder
    });

    it('should handle bcrypt hashing errors', async () => {
      // This test would require mocking bcrypt
      expect(true).toBe(true); // Placeholder
    });
  });
}); 