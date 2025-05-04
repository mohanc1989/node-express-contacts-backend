const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;

app.use("/api/contacts", require("./route/contactRoutes"));
app.listen(port, () => {

    console.log(`i am running on the port ${port} `);

});