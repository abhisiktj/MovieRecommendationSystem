const crypto=require("crypto");

const genSalt=()=>{
    //creating a unique salt everytime
    return crypto.randomBytes(16).toString('hex');
 
}
module.exports={genSalt};