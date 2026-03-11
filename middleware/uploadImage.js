const { upload } = require('../config/cloudinary');
const multer = require('multer');

// Middleware for single image upload
const uploadImage = upload.single('image');

// Wrapper middleware to handle multer errors
const handleImageUpload = (req, res, next) => {
    uploadImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum size is 5MB.'
                });
            }
            return res.status(400).json({
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // Other errors
            return res.status(400).json({
                message: err.message
            });
        }
        
        // If no file was uploaded, continue without error
        if (!req.file) {
            return next();
        }
        
        // Add the uploaded file URL to the request body
        req.body.image = req.file.path;
        next();
    });
};

module.exports = handleImageUpload;
