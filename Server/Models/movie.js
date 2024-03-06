const mongoose=require('mongoose');



const movieSchema=mongoose.Schema({
    director_name:{
        type:String,
    },
    actors:{
        type:[String],
    },
    genres:{
        type:[String]
    },
    movie_title:{
        type:String
    }

},{timestamps:true});


module.exports=mongoose.model("Movies",movieSchema);