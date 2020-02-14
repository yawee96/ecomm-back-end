const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan"); //use morgan as middleware
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); //saving user credentials in the cookies
const expressValidator = require("express-validator");
const cors = require("cors");

const app = express();

require("dotenv").config() //this allows us to use the .env variables

//import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user")
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')

//db connection
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true }).then(() => console.log("DB Connected"));

mongoose.connection.on("error", err => { console.log(`Db connection error: ${err.message}`) });

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json()); //so we get json data from the request data
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

//routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);

//port number
const port = process.env.PORT || 8000;

//listen for port connection
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
