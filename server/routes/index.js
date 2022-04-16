const express = require("express");
const authRouter = require('./auth')
const subRouter = require('./subs')
const router = express.Router();


router.use(authRouter);
router.use(subRouter);

module.exports = router 