const express = require('express');
const authController = require('./../controllers/user_controller');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.get('/verify-email/:token', authController.verifyEmail);
userRouter.post('/login', authController.login);

module.exports = userRouter;
