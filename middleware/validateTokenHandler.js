const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler( async(req,res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    console.log('header', authHeader);
    if(authHeader && authHeader.startsWith('Bearer')){
        token = authHeader.split(" ")[1];
        console.log('token', token);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            console.log('jwt vverify', token);
            if(err){
                res.status(401);
                throw new Error("User is not authorizsed");
            }
            console.log('decoded infor', decoded);
            req.user = decoded.user;
            next();
        });
    }
    console.log('token outside', token);

    if(!token){
        res.status(401);
        throw new Error("Token in invalid or expired");
    }
});

module.exports=validateToken;