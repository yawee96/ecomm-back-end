const User = require("../models/user");
const jwt = require("jsonwebtoken"); // used to generate signed token
const expressJwt = require("express-jwt") // for authorization check
const { errorHandler } = require("../helpers/dbErrorHandling");

exports.signup = (req, res) => {

    //console.log("req.body: ", req.body);
    const user = new User(req.body);

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        })
    })
}

exports.signin = (req, res) => {
    //find the user based on email
    const { email, password } = req.body

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "User with that email does not exist. Please signup"
            })
        }
        // if user is found, make sure the email and password is matched (authenticated)
        // Create authenticate method in user model
        if (!user.authenticate(password)) {
            return res.state(401).json({
                error: "Email and password don't match"
            })
        }
        // generate a signed token with user ID and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
        // persist the token as "t" in cookie with expiry date
        res.cookie("t", token, { expire: new Date() + 9999 }) // user is signed in as long as the cookie is matched for 9999 seconds
        // return response with user and token to frontend client
        const { _id, name, email, role } = user
        return res.json({ token, user: { _id, email, name, role } })
    })
}

exports.signout = (req, res) => {
    //clear cookie from res
    res.clearCookie("t");
    res.json({ message: "Signout success" })
}


//use this method as a middleware to protect any routes
//but this method is not strict enough, since we can 
//access anyone else's profile so we use isAuth() below
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
})

// So assuming we've logged in, req.profile and req.auth will return true since they exist
// Now we need to see if the user logged/authenticated in is equal to the user's page we're
// trying to access
// When expressJwt checks that our token is valid, it returns the decoded token value which includes
// properties such as user._id and puts it into req.user by default. But we changed that to req.auth instead by userProperty: "auth"
// So now we can check if the current logged in ID (req.auth_id) is equal to the ID of the user's page we're trying to access (req.profile._id)
exports.isAuth = (req, res, next) => {
    console.log("req.profile: " + req.profile)
    console.log("req.auth: " + req.auth)
    console.log("req.profile._id: " + req.profile._id)
    console.log("req.auth._id: " + req.auth._id)
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user) {
        return res.status(403).json({
            error: "Access denied"
        })
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        //0 is user, 1 is admin
        //user is not admin
        return res.status(403).json({
            error: "Admin resource! Access denied"
        })
    }
    next();
}