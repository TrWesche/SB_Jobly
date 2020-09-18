const express = require("express");
const ExpressError = require("../helpers/expressError");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

const router = new express.Router()

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
    try {
        // Validate username & password provided in request
        const {username, password} = req.body;
        if (!username || !password) {
            throw new ExpressError("Username & Password Required", 400);
        }

        // Validate username & password combination
        const queryData = await User.authenticate(req.body);
        if (!queryData) {
            throw new ExpressError("Invalid Username/Password", 400);
        }

        // Return JSON Web Token
        const token = jwt.sign(queryData, SECRET_KEY);
        res.cookie("uvert", token, {httpOnly: true})
        return res.json({ "token": token })
    } catch (error) {
        next(error)
    }
})

module.exports = router;