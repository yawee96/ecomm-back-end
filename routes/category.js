const express = require("express");
const router = express.Router();

//we have the method in the controllers
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth_v1");
const {userById} = require("../controllers/user_v1");
const { create, categoryById, read, update, remove, list } = require("../controllers/category");


router.get("/category/:categoryId", read)
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create)
router.put("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, update)
router.delete("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, remove)
router.get("/categories", list)


router.param("categoryId", categoryById);
//in router.param() it takes in a name (ie. categoryId) and callback function. The callback function takes in up to five parameters
//which are req (the request object), res (the response object), next (indicating the next middleware function), the value of the 
//"name" parameter, in this case, the value of "categoryId" which is a hex number in the url and name of the parameter
//so categoryById could look like categoryById = (req, res, next, id) { Category.findById(id)} to find the category in the database

router.param("userId", userById);

module.exports = router;