const CustomError=require("../Utils/customError.js");
const statusCodes=require('http-status-codes');
const expressAsyncHandler=require('express-async-handler');
//for unavailable routes
const notFound=expressAsyncHandler(async(req,res)=>{
  throw new CustomError(statusCodes.NOT_FOUND,'URL Not Available');
});

const errorHandler=async(error,req,res,next)=>{
 
  console.log(error);
        if(error instanceof CustomError){
            res.status(error.statusCode).json({success:false,message:error.message});
        }
        else if(error.code==11000){
          res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:"Duplicate Field"})
        }
        else
          res.status(statusCodes.INTERNAL_SERVER_ERROR).json({sucess:false,message:"Internal Server Error"});
}

module.exports={notFound,errorHandler};
