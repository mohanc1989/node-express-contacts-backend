const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

//@desc Post register
//@route GET /api/user/register
//@access public
const userRegister =  asyncHandler(async (req, res) => {
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All the fields are manditatory");
    }
    const userAvilable = await User.findOne({email});
    if(userAvilable){
        res.status(400);
        throw new Error("User Already registered");
    }
    //Hassed password
    const hassedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hassedPassword
    });
    if(user){
        res.status(201).json({id:user.id, email: user.email});
    }else{
        res.status(400);
        throw new Error("User data is not valid");
    }
    //res.json({messgage: "register route"});
});
//@desc login user
//@route post /api/user/login
//@access public
const userLogin = asyncHandler (async (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandiatoy");
    }
    const user = await User.findOne({email});
    if(user && await bcrypt.compare(password, user.password)){
        const accessToken = jwt.sign(
        { 
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
        },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"15m"}
        );
        res.status(200).json({accessToken});
    }else{
        res.status(401);
        throw new Error("email or password is invalid");
    }
    //res.json({messgage: "login route"})
});
//@desc Get Contact
//@route post /api/user/current
//@access private
const currentUser = asyncHandler (async (req,res) => {
    res.send(req.user);
});

module.exports = {userRegister,userLogin, currentUser}