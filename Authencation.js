const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { VoteDB } = require('./db');
const userSchema = require('./model/user');
const userModel = VoteDB.model('user', userSchema);

// Configure Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log("Received credentials", username, password);
    const user = await userModel.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    const isPasswordMatch = user.comparePassword(password);

    if (isPasswordMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect password' });
    }
  } catch (error) {
    return done(error);
  }
}));

// Middleware to authenticate requests
const MiddlewareAuthencation = passport.authenticate('local', { session: false });

module.exports = { passport, MiddlewareAuthencation };
