const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;

connectDb();

// CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json())

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/contacts", require("./route/contactRoutes"));
app.use("/api/users", require("./route/userRoutes"));
app.use(errorHandler);
app.listen(port, () => {

    console.log(`i am running on the port ${port} `);

});