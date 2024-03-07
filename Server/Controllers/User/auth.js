//importing npm packages
const expressAsyncHandler = require("express-async-handler");
const statusCodes = require("http-status-codes");
const jwt = require("jsonwebtoken");


//importing models
const User = require("../../Models/user");

//importing utils
const CustomError = require("../../Utils/customError");
const { generateTOTP } = require("../../Utils/generateOtp");
const { sendMail } = require("../../Utils/mail");

const {loginOTPCache,
  resetPasswordOTPCache,
  setCache,
  getCache,
  takeCache,
  hasCache}=require('../../Utils/User/cache');
const { genSalt } = require("../../Utils/genSalt");



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

  const salt=genSalt();
  const user = await User.create({
    name,
    email,
    password,
    salt
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

  if (user.twofaenabled) {
    res.status(statusCodes.OK).json({
      success: false,
      data: {
        twofa: true,
        message: "User Has two factor enabled authentication",
      },
    });
  }

  
  const isMatched=user.validPassword(password);

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
      twofa: false,
      token,
    },
  });
});

//sending otp for two factor
const otpTwoFAUser = expressAsyncHandler(async (req,res) => {
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

    const isMatched=user.validPassword(password);

  if (!isMatched)
    throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");
  
    const id=user._id;
    if (hasCache(loginOTPCache,id.toString())) {
      throw new CustomError(
        statusCodes.BAD_REQUEST,
        "Otp generated recently wait for few minutes"
      );
    }

  const otp = generateTOTP();
  const subject = "OTP For Two Factor Authentication";
  const text = `Your OTP is ${otp}.Do not share it!!!. Valid for 10 minutes`;
  const mailSent = await sendMail(email, subject, text);

  if (!mailSent)
  throw new CustomError(
    statusCodes.INTERNAL_SERVER_ERROR,
    "Unable to Send OTP via Mail"
  );

  const success=setCache(loginOTPCache,user._id.toString(),otp);
  if (!success) {
    throw new CustomError(
      statusCodes.INTERNAL_SERVER_ERROR,
      "Error While Caching OTP,try later"
    );
  }
  //sending otp in json in dev environment
  res.status(statusCodes.OK).json({
    success: true,
    data: {
      message: "Succesfully generated OTP and sent to mail",
      otp,
    },

});
})


//loggin in user with two fa
const loginTwoFA=expressAsyncHandler(async(req,res)=>{
  const { otp, email , password } = req.body;

  if (!otp) {
    throw new CustomError(statusCodes.BAD_REQUEST, "OTP required");
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

  const user = await User.findOne({ email });
  if (!user)
    throw new CustomError(
      statusCodes.UNAUTHORIZED,
      "No User With Such Email exists"
    );

    const isMatched=user.validPassword(password);

  if (!isMatched)
    throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");
  
    const id = user._id.toString();
    const isStored = hasCache(loginOTPCache,id);
    if (!isStored) {
      throw new CustomError(statusCodes.NOT_FOUND, "OTP expired");
    }

    const storedOtp = takeCache(loginOTPCache,id);
    console.log(storedOtp);
    if (Number(otp) != Number(storedOtp))
      throw new CustomError(
        statusCodes.UNAUTHORIZED,
        "Incorrect OTP.Generate OTP again"
      );
  
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
          twofa: true,
          token,
        },
      });
})

//change password
const changePassword =expressAsyncHandler(async (req, res) => {
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
        "New Password Field Can not be empty"
      );
    }

     let user=req.user;
     const email = user.email;
    const isMatched=user.validPassword(password);
 

    if (!isMatched)
      throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");

    
      user.password=newPassword;
      await user.save();

    res.status(statusCodes.CREATED).json({
      success: true,
      data: {
        message: "Password Updated",
      },
    });
  })



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
  const has=hasCache(resetPasswordOTPCache,id.toString());
  console.log(has);
  if (has) {
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


  
    const success=setCache(resetPasswordOTPCache,user._id.toString(),otp);
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
    throw new CustomError(statusCodes.BAD_REQUEST, "Password field is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "No User with given email id"
    );
  }

  const id = user._id.toString();
  const isStored=hasCache(resetPasswordOTPCache,id);
  if (!isStored) {
    throw new CustomError(statusCodes.NOT_FOUND, "OTP expired");
  }

  const storedOtp=takeCache(resetPasswordOTPCache,id);
  console.log(storedOtp);
  if (Number(otp) != Number(storedOtp))
    throw new CustomError(
      statusCodes.UNAUTHORIZED,
      "Incorrect OTP.Generate OTP again"
    );

  
  user.password=password;
  await user.save();

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

  if (!toggle == "true" && !toggle == "false") {
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      "Toggle must be a true or false"
    );
  }

  let flag = false;
  if (toggle == "true") flag = true;

  const user = req.user;
  const isMatched=user.validPassword(password);

  if (!isMatched)
    throw new CustomError(statusCodes.UNAUTHORIZED, "Incorrect Password");

  if (toggle == user.twofaenabled)
    throw new CustomError(
      statusCodes.BAD_REQUEST,
      `Two factor is alredy set to ${toggle}`
    );

  await User.findByIdAndUpdate(user._id, { twofaenabled: flag });
  res.status(statusCodes.ACCEPTED).json({
    success: true,
    data: {
      message: `Two Factor Authentication set to ${toggle}`,
    },
  });
});



module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  toggletwofa,
  otpTwoFAUser,
  loginTwoFA
};
