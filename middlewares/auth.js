const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const user = require("./../models/user_model");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_STR);
    req.user = await user.findById(decodedToken.id).select("-password");
    next();

  }
  if (!token) {
    res.status(400).json({
      status: 'fail',
      message: 'Not authorized!, Please provide a valid token!'
    });
  }
});

module.exports = protect;