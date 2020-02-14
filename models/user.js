const mongoose = require("mongoose");

const crypto = require("crypto"); //for password security

const uuidv1 = require("uuid/v1"); //for unique user id

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true, //any space in the beginning or end will be trimmed
            required: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        hashed_password: { //we hash the password so it will be secure
            type: String,
            require: true
        },
        about: {
            type: String,
            trim: true
        },
        salt: String,
        role: {
            type: Number, //0 will be standard user, 1 will be admin
            default: 0
        },
        history: { // sell/purchase history
            type: Array,
            default: []
        }
        // ,
        // last_name: {
        //     type: String,
        //     trim: true,
        //     required: true,
        //     maxlength: 32
        // },
        // ,
        // contact_phone_number: {
        //     type: Number,
        //     require: true,
        //     maxlength: 15
        // },
        // company_name: {
        //     type: String,
        //     trim: true,
        //     require: true,
        //     maxlength: 60
        // }
        // ,
        // client_type: {
        //     type: Number, //0 will be End User, 1 will be Parts Dealer
        //     default: 0
        // }
    }, { timestamps: true }
);

//virtual field
userSchema
    .virtual("password") //sending password from client side
    .set(function (password) {
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema.methods = {

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
        // so the user supplies the password and we encrypt it using sha256 and salt thus spitting out a unique number
        // if this number matches the hashed_password then the user is authenticated
    }
    ,
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto.createHmac("sha256", this.salt)
                .update(password)
                .digest("hex")
        }
        catch (error) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);