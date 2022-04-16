const User = require('../models/user');
const { Strategy, ExtractJwt } = require('passport-jwt');
require('dotenv').config()

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};
const jwtStrategy = new Strategy(jwtOptions, jwtVerify);
module.exports = { jwtStrategy }

