const express = require("express");

const {authController}= require("../../Controllers/index");
const {
  registerUser,
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  toggletwofa,
  otpTwoFAUser,
  loginTwoFA
} =authController

const auth = require("../../Middlewares/auth");

const authRouter = express.Router();

//unauthorized routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/login/twofa/getotp",otpTwoFAUser);
authRouter.post("/login/twofa",loginTwoFA);
authRouter.post("/password/forget", forgetPassword);
authRouter.patch("/password/reset",resetPassword);

//authorized routes
authRouter.patch("/password/change", auth, changePassword);
authRouter.patch('/twofa/toggle',auth, toggletwofa )

module.exports = {authRouter};
