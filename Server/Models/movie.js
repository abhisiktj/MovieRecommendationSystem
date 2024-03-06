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
    },
    favourites:{
        type:Number,
        default:0
    }

},{timestamps:true});


module.exports=mongoose.model("Movie",movieSchema);