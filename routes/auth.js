const express = require("express");
const router = express.Router();

//we have the method in the controllers
const {signup, signin, signout, requireSignin} = require("../controllers/auth_v1");
const {userSignupValidator} = require("../validator/index")


router.post("/signup", userSignupValidator, signup) //first run userSignUpValidator and if that's good then go onto next which is signup

router.post("/signin", signin);

router.get("/signout", signout);

router.get("/hello", requireSignin, (req,res) => {
    res.send("hello there")
})

module.exports = router;