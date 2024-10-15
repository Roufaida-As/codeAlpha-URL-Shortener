const userModel = require("./../models/user_model");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const email_service = require('./../services/email_service');

// JWT token generation function
const signToken = id => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};



exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Step 1: Verify the email with Hunter.io before proceeding
  const isEmailDeliverable = await email_service.verifyEmailWithHunter(email);
  if (!isEmailDeliverable) {
    return res.status(400).json({
      status: 'fail',
      message: 'The provided email address is not deliverable. Please use a valid email address.',
    });
  }

  
  // Step 2: Proceed with user registration
  const newUser = await userModel.create({ name, email, password });

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  newUser.verificationToken = verificationToken;
  newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours
  await newUser.save();

  // Send verification email
  await email_service.sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    message: 'Please check your email to verify your account.',
  });
});

// EMAIL VERIFICATION
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user by token and check if it's not expired
  const user = await userModel.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or has expired.',
    });
  }

  // Mark user as verified and remove the verification token
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // Generate JWT for the verified user
  const authToken = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully. You can now log in.',
    token: authToken,
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are present in req.body
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please enter your email and password!',
    });
  }

  // Check if user exists
  const user = await userModel.findOne({ email });

  // Check if the user exists and password matches
  if (!user || !(await user.matchPassword(password))) {
    return res.status(400).json({
      status: 'fail',
      message: 'Incorrect email or password!',
    });
  }

  // Check if email is verified
  if (!user.isVerified) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please verify your email before logging in.',
    });
  }

  const token = signToken(user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  });
});
