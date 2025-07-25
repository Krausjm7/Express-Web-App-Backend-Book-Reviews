const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    //Write the authenication mechanism here
    if(req.session.authorization) { //get the authorization object stored in the session
        token = req.session.authorization['accessToken']; //retrieve the token from authorization object
        jwt.verify(token, "access",(err,user)=>{ //Use JWT to verify token. "access" should match your JWT secret
            if(!err){
                req.user = user; // Attach user info to request
                next(); // Proceed to the next middleware/route
            }
            else{
                return res.status(403).json({message: "User not authenticated"})
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});

const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));