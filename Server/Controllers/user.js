//importing npm packages
const expressAsyncHandler = require("express-async-handler");
const statusCodes = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeCache = require("node-cache");

//importing models
const User = require("../Models/user");

//importing utils
const CustomError = require("../Utils/customError");
const { generateTOTP } = require("../Utils/generateOtp");
const { sendMail, sendMails } = require("../Utils/mail");

//init
const myCache = new nodeCache({ stdTTL: 1000, checkperiod: 120 });
myCache.set("key", 10);

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
  controller generates otp and caches it against userId
  sends mail to client with otp
*/
const forgetPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError(statusCodes.BAD_REQUEST, "Email Field Is Required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "No user found with given mail"
    );
  }

  const id = user._id;
  if (myCache.has(id.toString())) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Otp generated recently wait for few minutes"
    );
  }

  const otp = generateTOTP();
  const subject = "OTP For Password Resetting";
  const text = `Your OTP is ${otp}.Do not share it!!!. Valid for 10 minutes`;
  const mailSent = await sendMail(email, subject, text);

  if (!mailSent)
    throw new CustomError(
      statusCodes.INTERNAL_SERVER_ERROR,
      "Unable to Send OTP via Mail"
    );

  const success = myCache.set(id.toString(), otp);

  if (!success) {
    throw new CustomError(
      statusCodes.INTERNAL_SERVER_ERROR,
      "Error While Caching OTP,try later"
    );
  }

  res.status(statusCodes.OK).json({
    success: true,
    data: {
      message: "Succesfully generated OTP and sent to mail",
      otp,
    },
  });
});

/*
controller to change password using otp
*/
const resetPassword = expressAsyncHandler(async (req, res) => {
  const { otp, email, password } = req.body;
  if (!otp) {
    throw new CustomError(statusCodes.BAD_REQUEST, "OTP required");
  }
  if (!email) {
    throw new CustomError(statusCodes.BAD_REQUEST, "Email field is required");
  }

  if (!password) {
    throw new password(statusCodes.BAD_REQUEST, "Password filed is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "No User with given email id"
    );
  }

  const id = user._id.toString();
  const isStored = myCache.has(id);
  if (!isStored) {
    throw new CustomError(statusCodes.NOT_FOUND, "OTP expired");
  }

  const storedOtp = myCache.take(id);
  console.log(storedOtp);
  if (Number(otp) != Number(storedOtp))
    throw new CustomError(
      statusCodes.UNAUTHORIZED,
      "Incorrect OTP.Generate OTP again"
    );

  const salting = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salting);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { password: hashedPassword },
    { new: true }
  );

  res.status(statusCodes.CREATED).json({
    success: true,
    data: {
      message: "Password Changed.Try logging in again",
    },
  });
});

//controller to toggle two fa
const toggletwofa = expressAsyncHandler(async (req, res) => {
  const { password, toggle } = req.body;
  if (!password) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Password required for enabling Two factor authentication"
    );
  }

  if (!toggle=="true" && !toggle=="false") {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Toggle must be a true or false"
    );
  }
 
  let flag=false;
  if(toggle=="true")
     flag=true;
  

  const user = req.user;
  const isMatched = bcrypt.compare(password, user?.password);

  if (!isMatched)
    throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");

  if(toggle==user.twofaenabled)
    throw new CustomError(statusCodes.BAD_REQUEST,`Two factor is alredy set to ${toggle}`);

  await User.findByIdAndUpdate(user._id,{twofaenabled:flag});
  res.status(statusCodes.ACCEPTED).json({
      success:true,
      data:{
        message:`Two Factor Authentication set to ${toggle}`
      }
  })
});



module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  toggletwofa,
};
