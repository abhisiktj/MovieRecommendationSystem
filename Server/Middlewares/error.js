const CustomError=require('../Utils/customError');

const errorHandler=async(error,req,res,next)=>{
        if(error instanceof CustomError){
            res.status(error.statusCode).json({success:false,message:error.message});
        }
        else
          res.status(500).json({sucess:false,message:"Internal Server Error"});
}

module.exports=errorHandler;
