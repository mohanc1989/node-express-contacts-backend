//@desc Get Contacts
//@route GET /api/contacts
//@access public

const getContacts = (req, res) => {
    res.status(200).json({message : "Get all contacts"});
};

//@desc Get Contact
//@route GET /api/contact/:id
//@access public

const getContact = (req, res) => {
    res.status(200).json({message : `Get contact for ${req.params.id}`});
};

//@desc Create Contact
//@route POST /api/contact
//@access public

const creatContact = (req, res) => {
    console.log("the request body is :", req.body);
    const {name,email,phone} = req.body;
    if(!name || !email || phone) {
        res.status(400);
        throw new Error("All Fields are mandatory");
        
    }
    res.status(201).json({message : "Create contact"});
};

//@desc Update Contact
//@route PUT /api/contacts/id
//@access public

const updateContact = (req, res) => {
    res.status(200).json({message : `update contact for ${req.params.id}`});
};

//@desc Delete Contact
//@route PUT /api/contacts/id
//@access public

const deleteContact = (req, res) => {
    res.status(200).json({message : `Delete contact for ${req.params.id}`});
};

module.exports = {getContacts,creatContact,updateContact,deleteContact,getContact};