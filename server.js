const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;

connectDb();
app.use(express.json())
app.use("/api/contacts", require("./route/contactRoutes"));
app.use("/api/users", require("./route/userRoutes"));
app.use(errorHandler);
app.listen(port, () => {

    console.log(`i am running on the port ${port} `);

});