const express = require("express");
const router = express.Router();
const {getContacts,creatContact,updateContact,deleteContact,getContact} = require("../controller/contactController");
const validateToken = require("../middleware/validateTokenHandler");
const handleImageUpload = require("../middleware/uploadImage");

router.use(validateToken);
router.route("/").get(getContacts).post(handleImageUpload, creatContact);
router.route("/:id").put(handleImageUpload, updateContact).delete(deleteContact).get(getContact);
module.exports = router;