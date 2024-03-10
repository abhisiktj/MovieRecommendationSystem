const mongoose=require('mongoose');
const crypto=require('node:crypto');



const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name field is required"],
    
    },
    email:{
        type:String,
        required:[true,"Email field is required"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Password field is required"],
    },
    salt:{
        type:String,
        required:[true,"Salt required"],
    },
    twofaenabled:{
        type:Boolean,
        default:false
    },
    favourites:{
        type:[String],
        default:[]
    },
    watchlist: {
        type: mongoose.Types.ObjectId,
        ref: "Watchlist",
      },
},{timestamps:true});


userSchema.pre('save',async function(){
    // Hashing user's salt and password with 1000 iterations,
  
    this.password = crypto.pbkdf2Sync(this.password, this.salt,
        1000, 64, `sha512`).toString(`hex`);
 
 })

userSchema.methods.validPassword = function (password) {
     const hash = crypto.pbkdf2Sync(password,
        this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.password == hash;
};

module.exports=mongoose.model("User",userSchema);
