const express = require('express')
const { auth } = require("../middlewares/index")

const router = express.Router();
const { register, login, deleteUser } = require('../controllers/auth');


router.post("/api/register", register);
router.post("/api/login", login);
router.delete("/api/deleteUser", deleteUser)


module.exports = router