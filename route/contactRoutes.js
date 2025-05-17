const express = require("express");
const router = express.Router();
const {getContacts,creatContact,updateContact,deleteContact,getContact} = require("../controller/contactController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);
router.route("/").get(getContacts).post(creatContact);
router.route("/:id").put(updateContact).delete(deleteContact).get(getContact);
module.exports = router;