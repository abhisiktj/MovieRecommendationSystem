const mongoose=require('mongoose');

const ActorSchema = new Schema({ name: String });
const GenreSchema = new Schema({ name: String });
const moviesSchema=mongoose.Schema({
    director_name:{
        type:String,
    },
    actors:{
        type:[{ActorSchema}],
    },
    genres:{
        type:[{GenreSchema}]
    },
    movie_title:{
        type:String
    }

},{timestamps:true});


module.exports=mongoose.model("Movie",moviesSchema);