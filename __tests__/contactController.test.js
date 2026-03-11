const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getContacts, creatContact, updateContact, deleteContact, getContact } = require('../controller/contactController');
const Contact = require('../model/contactModel');
const User = require('../model/userModel');
const validateToken = require('../middleware/validateTokenHandler');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes for testing
app.use('/api/contacts', validateToken);
app.get('/api/contacts', getContacts);
app.post('/api/contacts', creatContact);
app.get('/api/contacts/:id', getContact);
app.put('/api/contacts/:id', updateContact);
app.delete('/api/contacts/:id', deleteContact);

// Add error handler middleware
const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

describe('Contact Controller Tests', () => {
  let testUser;
  let accessToken;
  let testContact;

  beforeEach(async () => {
    // Clear any existing test data
    await User.deleteMany({});
    await Contact.deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });

    // Generate access token
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

    // Create a test contact
    testContact = await Contact.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      image: null,
      user_id: testUser.id
    });
  });

  describe('POST /api/contacts', () => {
    it('should create a new contact successfully', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321'
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(contactData.name);
      expect(response.body.email).toBe(contactData.email);
      expect(response.body.phone).toBe(contactData.phone);
      expect(response.body.image).toBeNull();
      expect(response.body.user_id).toBe(testUser.id);

      // Verify contact was saved to database
      const savedContact = await Contact.findById(response.body._id);
      expect(savedContact).toBeTruthy();
      expect(savedContact.name).toBe(contactData.name);
    });

    it('should create a contact with image successfully', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        image: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg'
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(contactData.name);
      expect(response.body.email).toBe(contactData.email);
      expect(response.body.phone).toBe(contactData.phone);
      expect(response.body.image).toBe(contactData.image);
      expect(response.body.user_id).toBe(testUser.id);
    });

    it('should return 400 when name is missing', async () => {
      const contactData = {
        email: 'jane@example.com',
        phone: '0987654321'
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandatory');
    });

    it('should return 400 when email is missing', async () => {
      const contactData = {
        name: 'Jane Smith',
        phone: '0987654321'
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandatory');
    });

    it('should return 400 when phone is missing', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('mandatory');
    });

    it('should return 401 without authentication token', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(401);
    });
  });

  describe('GET /api/contacts', () => {
    it('should return all contacts for the authenticated user', async () => {
      // Create another contact for the same user
      await Contact.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        image: null,
        user_id: testUser.id
      });

      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('phone');
      expect(response.body[0]).toHaveProperty('image');
      expect(response.body[0]).toHaveProperty('user_id', testUser.id);
    });

    it('should return empty array when user has no contacts', async () => {
      // Clear all contacts
      await Contact.deleteMany({});

      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(401);
    });

    it('should not return contacts from other users', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      // Create contact for other user
      await Contact.create({
        name: 'Other Contact',
        email: 'other@example.com',
        phone: '5555555555',
        image: null,
        user_id: otherUser.id
      });

      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('John Doe');
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return a specific contact by ID', async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', testContact._id.toString());
      expect(response.body.name).toBe(testContact.name);
      expect(response.body.email).toBe(testContact.email);
      expect(response.body.phone).toBe(testContact.phone);
      expect(response.body.image).toBe(testContact.image);
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/contacts/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContact._id}`)
        .expect(401);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update a contact successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999'
      };

      const response = await request(app)
        .put(`/api/contacts/${testContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.phone).toBe(updateData.phone);

      // Verify contact was updated in database
      const updatedContact = await Contact.findById(testContact._id);
      expect(updatedContact.name).toBe(updateData.name);
    });

    it('should update a contact with image successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999',
        image: 'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg'
      };

      const response = await request(app)
        .put(`/api/contacts/${testContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.phone).toBe(updateData.phone);
      expect(response.body.image).toBe(updateData.image);

      // Verify contact was updated in database
      const updatedContact = await Contact.findById(testContact._id);
      expect(updatedContact.image).toBe(updateData.image);
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999'
      };

      const response = await request(app)
        .put(`/api/contacts/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 403 when trying to update another user\'s contact', async () => {
      // Create another user and contact
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const otherContact = await Contact.create({
        name: 'Other Contact',
        email: 'other@example.com',
        phone: '5555555555',
        image: null,
        user_id: otherUser.id
      });

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999'
      };

      const response = await request(app)
        .put(`/api/contacts/${otherContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 401 without authentication token', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999'
      };

      const response = await request(app)
        .put(`/api/contacts/${testContact._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a contact successfully', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${testContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', testContact._id.toString());
      expect(response.body.name).toBe(testContact.name);

      // Verify contact was deleted from database
      const deletedContact = await Contact.findById(testContact._id);
      expect(deletedContact).toBeNull();
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/contacts/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 403 when trying to delete another user\'s contact', async () => {
      // Create another user and contact
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const otherContact = await Contact.create({
        name: 'Other Contact',
        email: 'other@example.com',
        phone: '5555555555',
        image: null,
        user_id: otherUser.id
      });

      const response = await request(app)
        .delete(`/api/contacts/${otherContact._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${testContact._id}`)
        .expect(401);
    });
  });
}); 