const express = require("express");
const router = express.Router();
const {getContacts,creatContact,updateContact,deleteContact,getContact} = require("../controller/contactController")

router.route("/").get(getContacts).post(creatContact);
router.route("/:id").put(updateContact).delete(deleteContact).get(getContact);
module.exports = router;