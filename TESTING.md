# 🧪 Testing Documentation

This document provides comprehensive information about the testing setup and how to run tests for the Contact Management API.

## 📋 Test Structure

```
├── __tests__/
│   ├── userController.test.js    # User authentication tests
│   └── contactController.test.js # Contact CRUD tests
├── test/
│   └── setup.js                  # Test configuration
├── jest.config.js               # Jest configuration
└── TESTING.md                   # This file
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Individual Test Files

```bash
# Run only user controller tests
npm test userController.test.js

# Run only contact controller tests
npm test contactController.test.js
```

## 📊 Test Coverage

The test suite covers:

### User Controller Tests
- ✅ User registration (success & validation)
- ✅ User login (success & authentication)
- ✅ Current user retrieval (with JWT validation)
- ✅ Password hashing verification
- ✅ JWT token generation and validation
- ✅ Error handling for missing fields
- ✅ Duplicate user registration prevention

### Contact Controller Tests
- ✅ Contact creation (CRUD operations)
- ✅ Contact retrieval (single & multiple)
- ✅ Contact updates (authorized users only)
- ✅ Contact deletion (authorized users only)
- ✅ User authorization (prevent cross-user access)
- ✅ Input validation (required fields)
- ✅ Authentication middleware testing

## 🛠️ Test Environment

### Dependencies
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **bcrypt**: Password hashing verification
- **jsonwebtoken**: JWT token testing

### Test Database
- Uses MongoDB Memory Server for isolated testing
- No external database connection required
- Automatic cleanup between tests
- Isolated test environment

## 📝 Test Categories

### 1. Unit Tests
- Individual function testing
- Input validation
- Error handling
- Business logic verification

### 2. Integration Tests
- API endpoint testing
- Database operations
- Authentication flow
- Middleware integration

### 3. Security Tests
- JWT token validation
- Password hashing
- User authorization
- Cross-user access prevention

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'middleware/**/*.js',
    'model/**/*.js',
    'route/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000
};
```

### Test Setup (`test/setup.js`)
- MongoDB Memory Server initialization
- Environment variable configuration
- Database cleanup between tests
- JWT secret setup

## 📈 Coverage Reports

After running `npm run test:coverage`, you'll get:

- **Text Report**: Console output with coverage percentages
- **HTML Report**: Detailed coverage in `coverage/index.html`
- **LCOV Report**: For CI/CD integration

### Coverage Targets
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

## 🐛 Debugging Tests

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check if MongoDB Memory Server is working
   npm test -- --verbose
   ```

2. **JWT Token Issues**
   ```bash
   # Verify environment variables
   echo $ACCESS_TOKEN_SECRET
   ```

3. **Test Timeout**
   ```bash
   # Increase timeout for slow tests
   npm test -- --testTimeout=30000
   ```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
npm test -- --verbose userController.test.js
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:coverage
```

## 📚 Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Isolation**: Each test should be independent
4. **Cleanup**: Always clean up test data
5. **Mocking**: Mock external dependencies

### Test Data
- Use realistic test data
- Avoid hardcoded values
- Generate unique test data
- Clean up after each test

### Error Testing
- Test both success and failure scenarios
- Verify error messages
- Test edge cases
- Validate HTTP status codes

## 🎯 Future Enhancements

### Planned Test Additions
- [ ] API documentation tests
- [ ] Performance tests
- [ ] Load testing
- [ ] Security vulnerability tests
- [ ] Database migration tests
- [ ] Environment configuration tests

### Test Utilities
- [ ] Test data factories
- [ ] Custom matchers
- [ ] Test helpers
- [ ] Mock generators

## 📞 Support

For testing issues or questions:
- Check the test logs for detailed error messages
- Review the Jest documentation
- Verify environment setup
- Ensure all dependencies are installed

---

**Happy Testing! 🧪✨** 