const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs")
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandling");

exports.productById = (req, res, next, id) => {
    Product.findById(id).populate("category").exec((err, product) => {
        if (err || !product) {
            return res.status(400).json({
                error: "Product not found"
            })
        }
        req.product = product;
        next()
    })
}

exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}


exports.create = (req, res) => {
    //handle form data and files that come with it (ie. image)
    let form = new formidable.IncomingForm() //all the form data will be from here

    form.keepExtensions = true //whatever image type we're getting, the image type will be there

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        //check for all fields

        const { name, description, price, category, quantity, shipping } = fields;
        //if(!name || !description || !price || !category || !quantity || !shipping){
        if (!name || !description || !price || !category) {
            //console.log("HERE!!!!!!!!!!!!!!!!!!!!!!!309490238420840932809")
            return res.status(400).json({
                error: "All fields, name, description, price, category (id), quantity, and shipping are required"
            })
        }

        let product = new Product(fields) //create new product with the fields we got

        //1kb = 1000
        //1mb = 1,000,000
        //if there are files, we need to handle that as well
        if (files.photo) {
            //console.log("Files Photo: ", files.photo)
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1MB in size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        })
    })
}

exports.remove = (req, res) => {
    //we can grab the productId from req because everytime there is productId in the params productById() runs
    //and in the function we find the product based on the ID and store it in req
    console.log(req);
    let product = req.product
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({
            "message": "Product deleted successfully"
        })
    })
}

exports.update = (req, res) => {
    //similar to create method
    //we take the product from req.product which is given from productById()
    let form = new formidable.IncomingForm() //all the form data will be from here

    form.keepExtensions = true //whatever image type we're getting, the image type will be there

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        //check if there exists one field

        // const { name, description, price, category, quantity, shipping} = fields;
        // if (!name && !description && !price && !category && !quantity && !shipping && !files) {
        //     return res.status(400).json({
        //         error: "Atleast one field, name, description, price, category (id), quantity, or shipping are required"
        //     })
        // }

        //doesn't need to check for all fields because if we want to just update the name we don't need
        //to input the same data for the rest of the fields again

        let product = req.product
        console.log("Product: " + req.product);
        console.log("Fields: " + JSON.stringify(fields));
        product = _.extend(product, fields)
        //_.extend(destination, source) is a function that takes in a destination and source
        //and basically copies source into destination and overwriting destination with source
        //if there are updates to keys
        // example destination = {a: 1, b: 2} source = {a: 3, c: 4, d: 5}
        //output: {a:3, b:2, c:4, d:5}
        console.log("Final Product: " + product)

        //1kb = 1000
        //1mb = 1,000,000
        //if there are files, we need to handle that as well
        if (files.photo) {
            console.log("Files Photo: ", files.photo)
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1MB in size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        })
    })

}

//return product by most popular
//params
// "/products?sortBy=sold&order=desc&limit=4"

//return product by arrival
//params
// "/products?sortBy=createdAt&order=desc&limit=4"

//if no params are sent, then all products are returned

exports.list = (req, res) => {
    // if there exists an order in the query, use that order, otherwise ascending
    let order = req.query.order ? req.query.order : "asc"
    // if there exists a sortBy in the query, use that sort, otherwise sort by _id
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id"
    // if there exists a limit on the number of items returned, use that limit, otherwise limit to 6
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
        // by doing "-photo" we are excluding photo and including the other fields
        // we want to do this because it's going to be very slow to send the photo
        .select("-photo")
        // we want to populate the category associated with the product
        .populate("category")
        //
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                })
            }
            res.json(products);
        })
}

/**
 * It will find the products based on the req product category
 * other products that has the same category will be returned
 */

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    //find all the products except for the product in the params and based on the category
    Product.find({ _id: { $ne: req.product }, category: req.product.category })
        .limit(limit)
        .populate("category", "_id name")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                })
            }
            res.json(products);
        })
}

// this just lists the categories that actually have products
// for example, a category, shoes, may not have any products and thus shoes category is not returned
exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: "Products not found"
            })
        }
        res.json(categories);
    })
}

exports.listBrands = (req, res) => {
    Product.distinct("brand", {}, (err, brands) => {
        if (err) {
            return res.status(400).json({
                error: "Products not found"
            })
        }
        res.json(brands);
    })
}

/**
 * list products by search
 * implemented in react frontend
 * show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * make api request and show the products to users based on what they want
 */

exports.listBySearch = (req, res) => {
    console.log("REQ.BODY: ", JSON.stringify(req.body));
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "createdAt";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    console.log(order, sortBy, limit, skip, req.body.filters);
    console.log("findArgs before: ", findArgs);
    for (let key in req.body.filters) {
        console.log("listBySearch ===========================================", req.body.filters[key], key)
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
    console.log("findArgs after: ", findArgs);
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

//works as a middleware

exports.getPhoto = (req, res, next) => {
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType)//content type could be img.png, img.jpeg etc
        return res.send(req.product.photo.data)
    }

    next();
}

// TODO:    Search in description as well
// TODO:    Perhaps don't match exactly what is searched, but maybe like a percentage?
//          or if a word is in the string then match that
exports.listSearch = (req, res) => {
    //create query object to hold search value and category value
    const query = {}
    // then assign search value to query.name
    if(req.query.search) {
        console.log("REQ.QUERY.SEARCH: ", req.query.search)
        console.log("REQ.QUERY.CATEGORY", req.query.category)
        query.name = {$regex: req.query.search, $options: "i"}
        //assign cateogry value to query.category (ie. const query = {})
        if(req.query.category && req.query.category != "All") {
            query.category = req.query.category
        }
        console.log("QUERY: ", query)
        //find the product based on query object with 2 properties "search" and "category"
        Product.find(query, (err,products) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            console.log("PRODUCTS: ", products)
            res.json(products)
            
        }).select("-photo");
    }
}