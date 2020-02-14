const User = require("../models/user")

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found"
            })
        }
        req.profile = user

        next();
    })
}

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined
    return res.json(req.profile);
};

exports.update = (req, res) => {
    console.log(req.body)
    //$set sets any updated fields coming in from req.body
    //{new: true} is so the updated document is returned in the callback because the default
    //is to return the original, unaltered document
    User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: "You are not authorized to update this profile"
            })
        }
        user.hashed_password = undefined;
        user.salt = undefined
        return res.json(user);
    })
}