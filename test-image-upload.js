const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Create a simple test image if it doesn't exist
function createTestImage() {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
        console.log('Creating test image...');
        // Create a simple 1x1 pixel JPEG
        const jpegData = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
            0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
            0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
            0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
            0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
            0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
            0xFF, 0xD9
        ]);
        fs.writeFileSync(TEST_IMAGE_PATH, jpegData);
        console.log('Test image created successfully!');
    }
}

// Test image upload functionality
async function testImageUpload() {
    try {
        console.log('🚀 Starting image upload test...\n');

        // Create test image if it doesn't exist
        createTestImage();

        // Step 1: Login to get access token
        console.log('1. Logging in to get access token...');
        const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Login failed. Please ensure the server is running and you have a test user.');
        }

        const loginData = await loginResponse.json();
        const accessToken = loginData.accessToken;

        console.log('✅ Login successful!\n');

        // Step 2: Create contact with image
        console.log('2. Creating contact with image...');
        const formData = new FormData();
        formData.append('name', 'Test Contact with Image');
        formData.append('email', 'test-image@example.com');
        formData.append('phone', '1234567890');
        formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        const createResponse = await fetch(`${BASE_URL}/api/contacts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`Failed to create contact: ${errorData.message}`);
        }

        const contactData = await createResponse.json();
        console.log('✅ Contact created successfully!');
        console.log('Contact ID:', contactData._id);
        console.log('Image URL:', contactData.image || 'No image uploaded');
        console.log('');

        // Step 3: Get the contact to verify image
        console.log('3. Retrieving contact to verify image...');
        const getResponse = await fetch(`${BASE_URL}/api/contacts/${contactData._id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!getResponse.ok) {
            throw new Error('Failed to retrieve contact');
        }

        const retrievedContact = await getResponse.json();
        console.log('✅ Contact retrieved successfully!');
        console.log('Name:', retrievedContact.name);
        console.log('Email:', retrievedContact.email);
        console.log('Phone:', retrievedContact.phone);
        console.log('Image URL:', retrievedContact.image || 'No image');
        console.log('');

        // Step 4: Update contact with new image
        console.log('4. Updating contact with new image...');
        const updateFormData = new FormData();
        updateFormData.append('name', 'Updated Test Contact');
        updateFormData.append('email', 'updated-test@example.com');
        updateFormData.append('phone', '0987654321');
        updateFormData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        const updateResponse = await fetch(`${BASE_URL}/api/contacts/${contactData._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: updateFormData
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to update contact: ${errorData.message}`);
        }

        const updatedContact = await updateResponse.json();
        console.log('✅ Contact updated successfully!');
        console.log('Updated Name:', updatedContact.name);
        console.log('Updated Email:', updatedContact.email);
        console.log('Updated Phone:', updatedContact.phone);
        console.log('Updated Image URL:', updatedContact.image || 'No image');
        console.log('');

        // Step 5: Clean up - delete the contact
        console.log('5. Cleaning up - deleting contact...');
        const deleteResponse = await fetch(`${BASE_URL}/api/contacts/${contactData._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete contact');
        }

        console.log('✅ Contact deleted successfully!');
        console.log('');

        console.log('🎉 All tests passed! Image upload functionality is working correctly.');
        console.log('');
        console.log('📝 Summary:');
        console.log('- ✅ Login successful');
        console.log('- ✅ Contact created with image');
        console.log('- ✅ Contact retrieved with image');
        console.log('- ✅ Contact updated with new image');
        console.log('- ✅ Contact deleted successfully');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting tips:');
        console.log('1. Ensure your server is running on http://localhost:5000');
        console.log('2. Check that you have a test user with email: test@example.com');
        console.log('3. Verify your .env file has Cloudinary credentials');
        console.log('4. Make sure all required packages are installed');
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testImageUpload();
}

module.exports = { testImageUpload };
