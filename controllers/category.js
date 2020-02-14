const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandling");

exports.categoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        console.log(category);
        if(err || !category) {
            return res.status(400).json({
                error: "Category does not exist"
            })
        }

        req.category = category;
        next();
    })
}

exports.read = (req, res) => {
    return res.json(req.category)
}

exports.create = (req, res) => {

    const category = new Category(req.body); //we'll pass in the name in req.body
    category.save( (err, data) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({data: data})
    })
}

exports.update = (req, res) => {
    const category = req.category;
    //categoryById puts the category object in req.category

    if(!req.body.name) {
        return res.status(400).json({
            error: "Requires a new name to update"
        })
    }
    category.name = req.body.name; //category only has one field

    category.save((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json(data);
    })
}

exports.remove = (req, res) => {
    const category = req.category;
    category.remove((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(
            {
                message: "Category deleted successfully"
            }
        );
    })
}

exports.list = (req, res) => {
    //Bottom method is basically the same as Category.find({}, function(err,user){ ... })
    Category.find().exec( (err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data);
    })
}