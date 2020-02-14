exports.userSignupValidator = (req, res, next) => {
    req.check("name", "Name is required").notEmpty(); //check is from expressValidator
    req.check("email", "Email is required").notEmpty();
    req.check("email", "Email must be between 3 to 32 characters")
        .matches(/.+\@.+\..+/)// checking for email pattern
        .withMessage("Must be valid email")
        .isLength({
            min: 4,
            max: 32
        });
    req.check("password", "Password is required").notEmpty()
    req.check("password")
        .isLength({ min: 6 })
        .withMessage("Password must contain at least 6 characters")
        .matches(/\d/)
        .withMessage("Password must contain a number");

    const errors = req.validationErrors()
    if (errors) {
        const firstError = errors.map(error => error.msg)[0]
        //this grabs the first error so that the user can correct that error
        //if there are remaining errors, then that is grabbed and shown
        return res.status(400).json({ error: firstError });
    }
    next(); //anytime you're making middleware, you need next() or else the website will halt
}