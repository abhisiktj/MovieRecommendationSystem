//importing npm packages
const expressAsyncHandler = require("express-async-handler");
const statusCodes = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeCache = require("node-cache");
const myCache = new nodeCache();

//importing models
const User = require("../Models/user");

//importing utils
const CustomError = require("../Utils/customError");
const { generateTOTP } = require("../Utils/generateOtp");
const { sendMail, sendMails } = require("../Utils/mail");

//register user(signup)
const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Name Field Can not be empty"
    );
  }

  if (!email) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Email Field Can not be empty"
    );
  }

  if (!password) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Password Field Can not be empty"
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError(statusCodes.BAD_REQUEST, "User Already Exist");
  }

  const salting = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salting);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWTSECRETKEY,
    { expiresIn: "30d" }
  );

  res.status(statusCodes.CREATED).json({
    success: true,
    data: {
      token,
    },
  });
});

//logging in user
const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Email Field Can not be empty"
    );
  }
  if (!password) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Password Field Can not be empty"
    );
  }

  const user = await User.findOne({ email });
  if (!user)
    throw new CustomError(
      statusCodes.UNAUTHORIZED,
      "No User With Such Email exists"
    );

  const isMatched = bcrypt.compare(password, user?.password);

  if (!isMatched)
    throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWTSECRETKEY,
    { expiresIn: "30d" }
  );

  res.status(statusCodes.OK).json({
    success: true,
    data: {
      token,
    },
  });
});

//change password
const changePassword = expressAsyncHandler(
  expressAsyncHandler(async (req, res) => {
    const { password, newPassword } = req.body;

    if (!password) {
      throw new CustomError(
        statusCodes.BAD_REQUEST,
        "Password Field Can not be empty"
      );
    }
    if (!newPassword) {
      throw new CustomError(
        statusCodes.BAD_REQUEST,
        "Password Field Can not be empty"
      );
    }

    const isMatched = await bcrypt.compare(password, req.user?.password);

    const email = req.user.email;
    if (!isMatched)
      throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");

    const salting = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salting);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    res.status(statusCodes.CREATED).json({
      success: true,
      data: {
        message: "Password Updated",
      },
    });
  })
);

//forgetPassword
/*
  controller generates otp and caches it against username
  sends mail to client with otp
*/
const forgetPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError(statusCodes.BAD_REQUEST, "Email Field Is Required");
  }

  //add code to check user in db and otp in cache

  const otp = generateTOTP();
  const subject = "OTP For Password Resetting";
  const text = `Your OTP is ${otp}.Do not share it!!!. Valid for 10 minutes`;
  const mailSent = await sendMail(email, subject, text);

  if (!mailSent)
    throw new CustomError(
      statusCodes.INTERNAL_SERVER_ERROR,
      "Unable to Send OTP via Mail"
    );

  //add code to store otp in cache

  res.send("Mail sent");
});

module.exports = { registerUser, loginUser, changePassword, forgetPassword };
