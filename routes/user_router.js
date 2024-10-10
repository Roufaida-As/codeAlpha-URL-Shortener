const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

// Register route
userRouter.route('/register').post(userController.signup);

// Login route
userRouter.route('/login').post( userController.login);

module.exports = userRouter;