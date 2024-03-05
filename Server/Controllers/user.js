//importing npm packages
const expressAsyncHandler = require("express-async-handler");
const statusCodes = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//importing models
const User = require("../Models/user");

//importing utils
const CustomError = require("../Utils/customError");

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
  if (existingUser){
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

//loggin in user
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
  if (!user) throw new CustomError(statusCodes.UNAUTHORIZED, "No User With Such Email exists");

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

module.exports = { registerUser, loginUser };
