const express = require("express");
const router = express.Router();

//we have the method in the controllers
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth_v1");
const {userById} = require("../controllers/user_v1");
const { create, productById, read, remove, update, list, listRelated, listCategories, listBySearch, getPhoto, listSearch, listBrands} = require("../controllers/product");


router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create)
router.get("/product/:productId", read);
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove)
router.put("/product/:productId/:userId",requireSignin, isAuth, isAdmin, update )

router.get("/products", list);
router.get("/products/search", listSearch);
router.get("/products/related/:productId", listRelated);

// this just lists the categories that actually have products
// for example, a category, shoes, may not have any products and thus shoes category is not returned
router.get("/products/categories", listCategories);
router.get("/products/brands", listBrands);

router.post("/products/by/search", listBySearch);

router.get("/product/photo/:productId", getPhoto)

router.param("userId", userById);

router.param("productId", productById)

module.exports = router;