const userModel = require("./../models/user_model");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken')

//creating the jwt string for each new user
const signToken = id => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES
  })
}

//REGISTER
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  newUser = await userModel.create({ name, email, password })

  const token = signToken(newUser._id)

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    token
  })
})


//LOGIN 

exports.login = asyncHandler(async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  //check if email & password present in req.body
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please enter you email and password!'
    })
  }

  //check if user exists with given email
  const user = await userModel.findOne({ email })

  //check if the user exists & password matches
  if (!user || !(await user.matchPassword(password, user.password))) {
    return res.status(400).json({
      status: 'fail',
      message: 'Incorrect email or password!'
    })
  }

  const token = signToken(user._id)

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  })
})

