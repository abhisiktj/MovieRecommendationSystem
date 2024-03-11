const CustomError=require("../Utils/customError");

const jwt = require("jsonwebtoken");
const User = require("../Models/user.js");
const expressAsyncHandler=require('express-async-handler');
const statusCodes=require('http-status-codes');


const auth = expressAsyncHandler(async (req, res, next) => {

  
  const { authorization } = req.headers;
  if (!authorization || ! authorization.startsWith("Bearer")) {
    throw new CustomError(statusCodes.BAD_REQUEST,"Authorization  Header Incorrect");
  }
    
      const token = authorization.split(" ")[1];
      try{
      const {id} =jwt.verify(token, process.env.JWTSECRETKEY);
      }
      
      catch(error){
        throw new CustomError(statusCodes.UNAUTHORIZED,"Unauthorized Access");
      }
      try{
      req.user = await User.findById(id).select('-favourites');
      next();
      }
      catch(error){
        throw new CustomError(statusCodes.UNAUTHORIZED,"Unauthorized Access");
      }


  });

module.exports=auth;