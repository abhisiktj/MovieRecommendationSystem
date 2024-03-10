const mongoose=require('mongoose');




const movieSchema=mongoose.Schema({
      movie_id:{
            type:String,
            required:true,
            unique:true,
            dropDups:true
      },
      rating:{
      type:Number
      }
},{timestamps:true});


module.exports=mongoose.model("Movie",movieSchema);