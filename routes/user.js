const express = require("express");
const router = express.Router();

//we have the method in the controllers
const {userById , read, update} = require("../controllers/user_v1");
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth_v1");

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
})

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);

router.param("userId", userById);
//anytime there is userId in the params, we run userById that will make the req.profile accessible
//This sees if the userId given in the params exists in the database
//Depending on what kind of authentication we have, we can either access that page or not

module.exports = router;