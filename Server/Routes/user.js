const express = require("express");

const {
  registerUser,
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  toggletwofa
} = require("../Controllers/user");
const auth = require("../Middlewares/auth");

const router = express.Router();

//unauthorized routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forget", forgetPassword);
router.patch("/password/reset",resetPassword);

//authorized routes
router.patch("/password/change", auth, changePassword);
router.patch('/toggletwofa',auth, toggletwofa )

module.exports = router;
