const express = require("express");
const router = express.Router();
const {getContacts,creatContact,updateContact,deleteContact,getContact} = require("../controller/contactController")

router.route("/").get(getContacts);
router.route("/").post(creatContact);
router.route("/:id").put(updateContact);
router.route("/:id").delete(deleteContact);
router.route("/:id").get(getContact);

module.exports = router;