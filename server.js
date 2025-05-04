const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use("/api/contacts", require("./route/contactRoutes"));
app.use(errorHandler);
app.listen(port, () => {

    console.log(`i am running on the port ${port} `);

});