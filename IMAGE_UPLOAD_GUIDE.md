# Image Upload Implementation Guide

This guide explains how to implement and use image upload functionality in your Node.js Express application.

## Overview

The image upload feature allows users to:
- Upload profile images for contacts
- Store images securely in the cloud (Cloudinary)
- Automatically resize and optimize images
- Delete old images when updating or deleting contacts

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Environment Variables**: Configure your `.env` file with Cloudinary credentials

## Environment Variables

Add these variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation

The required packages are already installed:

```bash
npm install multer cloudinary multer-storage-cloudinary
```

## File Structure

```
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── uploadImage.js         # Image upload middleware
├── model/
│   └── contactModel.js        # Updated with image field
├── controller/
│   └── contactController.js   # Updated to handle images
└── route/
    └── contactRoutes.js       # Updated with upload middleware
```

## How It Works

### 1. Image Upload Process

1. **Client sends multipart form data** with image file
2. **Multer middleware** processes the file upload
3. **Cloudinary storage** automatically uploads to cloud
4. **Image URL** is stored in the database
5. **Response** includes the contact with image URL

### 2. File Validation

- **File size limit**: 5MB maximum
- **Allowed formats**: jpg, jpeg, png, gif, webp
- **Automatic resizing**: Images are resized to 500x500 pixels
- **Error handling**: Comprehensive error messages

### 3. Image Management

- **Automatic cleanup**: Old images are deleted when updating
- **Cloud storage**: Images stored securely in Cloudinary
- **URL storage**: Only image URLs are stored in database

## API Endpoints

### Create Contact with Image

```http
POST /api/contacts
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "John Doe"
- email: "john@example.com"
- phone: "1234567890"
- image: [file]
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/contacts/image.jpg",
  "user_id": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Contact with Image

```http
PUT /api/contacts/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "Updated Name"
- email: "updated@example.com"
- phone: "9999999999"
- image: [file]
```

### Get Contact (includes image)

```http
GET /api/contacts/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/contacts/image.jpg",
  "user_id": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

### HTML Form Example

```html
<form action="/api/contacts" method="POST" enctype="multipart/form-data">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="phone" placeholder="Phone" required>
  <input type="file" name="image" accept="image/*">
  <button type="submit">Create Contact</button>
</form>
```

### JavaScript Example (Fetch API)

```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '1234567890');
formData.append('image', fileInput.files[0]);

fetch('/api/contacts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### React Example

```jsx
import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
      />
      <button type="submit">Create Contact</button>
    </form>
  );
};
```

## Error Handling

### Common Errors

1. **File too large**
   ```json
   {
     "message": "File size too large. Maximum size is 5MB."
   }
   ```

2. **Invalid file type**
   ```json
   {
     "message": "Only image files are allowed!"
   }
   ```

3. **Upload error**
   ```json
   {
     "message": "Upload error: [specific error]"
   }
   ```

## Testing

Run the tests to verify image upload functionality:

```bash
npm test
```

The tests include:
- Creating contacts with and without images
- Updating contacts with new images
- Proper error handling for invalid uploads

## Security Considerations

1. **File validation**: Only image files are accepted
2. **Size limits**: 5MB maximum file size
3. **Authentication**: All uploads require valid JWT token
4. **User isolation**: Users can only upload for their own contacts
5. **Automatic cleanup**: Old images are deleted when updating

## Troubleshooting

### Common Issues

1. **Environment variables not set**
   - Ensure all Cloudinary variables are in your `.env` file
   - Restart your server after adding environment variables

2. **File upload fails**
   - Check file size (must be under 5MB)
   - Verify file type (must be image)
   - Ensure proper multipart form data

3. **Image not displaying**
   - Check if the image URL is accessible
   - Verify Cloudinary configuration
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=multer:*
```

## Best Practices

1. **Always validate files** on both client and server
2. **Use appropriate file size limits** for your use case
3. **Implement proper error handling** for upload failures
4. **Clean up old files** when updating or deleting
5. **Use CDN URLs** for better performance
6. **Implement retry logic** for failed uploads
7. **Monitor storage usage** in Cloudinary dashboard

## Additional Features

### Future Enhancements

1. **Image compression**: Automatic compression for better performance
2. **Multiple image support**: Allow multiple images per contact
3. **Image cropping**: Client-side image cropping
4. **Watermarking**: Add watermarks to uploaded images
5. **Image optimization**: Automatic format conversion (WebP)
6. **Backup storage**: Local backup of important images

## Support

For issues or questions:
1. Check the error logs
2. Verify environment variables
3. Test with a simple image file
4. Check Cloudinary dashboard for upload status
