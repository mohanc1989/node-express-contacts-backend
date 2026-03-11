const asyncHandler = require("express-async-handler");
const Contact = require("../model/contactModel");
const { cloudinary } = require("../config/cloudinary");

//@desc Get Contacts
//@route GET /api/contacts
//@access private

const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({user_id: req.user.id});
    res.status(200).json(contacts);
});

//@desc Get Contact
//@route GET /api/contact/:id
//@access private

const getContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found")
    }
    res.status(200).json(contact);
});

//@desc Create Contact
//@route POST /api/contact
//@access private

const creatContact = asyncHandler(async (req, res) => {
    const {name, email, phone, image} = req.body;
    if(!name || !email || !phone) {
        res.status(400);
        throw new Error("All Fields are mandatory");
        
    }
    const contact = await Contact.create({
        name,
        email,
        phone,
        image: image || null,
        user_id:req.user.id
    })
    res.status(201).json(contact);
});

//@desc Update Contact
//@route PUT /api/contacts/id
//@access private

const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found")
    }
    if(contact.user_id.toString() !== req.user.id){
        res.status(403);
        throw new Error("User not authorized to update other contact");
    }

    // If there's a new image and the contact already has an image, delete the old one
    if (req.body.image && contact.image) {
        try {
            // Extract public_id from the Cloudinary URL
            const publicId = contact.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting old image:', error);
        }
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true}
    );
    res.status(200).json(updatedContact);
});

//@desc Delete Contact
//@route DELETE /api/contacts/id
//@access private

const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found")
    }
    if(contact.user_id.toString() !== req.user.id){
        res.status(403);
        throw new Error("User not authorized to delete other contact");
    }

    // Delete image from Cloudinary if it exists
    if (contact.image) {
        try {
            // Extract public_id from the Cloudinary URL
            const publicId = contact.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json(contact);
});

module.exports = {getContacts,creatContact,updateContact,deleteContact,getContact};