const express = require("express");
const cors = require("cors");
const app = express();
const port = 5001;

// CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get("/test", (req, res) => {
    res.status(200).json({ 
        message: "CORS and server setup working correctly",
        cors: "enabled"
    });
});

app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
    console.log(`Test endpoint available at: http://localhost:${port}/test`);
}); 