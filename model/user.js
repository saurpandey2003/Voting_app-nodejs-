const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  work: {
    type: String,
    enum: ['chef', 'waiter', 'manager'], // Corrected spelling: 'chief' to 'chef'
    required: true
  },
  mobile: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  salary: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  addharcardNo:{
    type:Number,
    required:true,
    unique:true

  },
  password: {
    type: String,
    required: true
  },
  isVoted:{
    type:Boolean,
    default:false
  }
  ,
  role:{
    type:String,
    enum:["voter","admin"],
    default:"voter"
  }
});

// Using a regular function to properly use `this`
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
}

module.exports = userSchema;
