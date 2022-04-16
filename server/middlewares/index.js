const expressJWT = require('express-jwt')
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const requireSignin = expressJWT({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
});





const auth = async (req, res, next) => {
    try {

        const user = await User.findOne({
            id: req.body._id,
        });
        console.log(user)
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
};

module.exports = { auth, requireSignin };