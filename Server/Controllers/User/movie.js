const expressAsyncHandler = require("express-async-handler");
const statusCodes = require("http-status-codes");

//importing models
const User = require("../../Models/user");
const { getMovieDetails } = require("../../Utils/Movies/tmdb");

//importing utils
const CustomError=require('../../Utils/customError');

//returns the list of favourite movies with pagination
const getFavouriteMovies = expressAsyncHandler(async (req, res) => {
  const user = req.user;
  const id = user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 3;

  const movies = await User.aggregate([
    { $match: { _id: id } },
    { $project: { _id: 0, favourites: 1 } },
    { $unwind: "$favourites" },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);
  

  const promises = movies.map(async (element) => {
    const movieDetails = await getMovieDetails(element.favourites);

    return !movieDetails
      ? {
          success: false,
          message: `Resource Not Available for movie_id:${element.favourites}`,
        }
      : movieDetails;
  });
  let data = [];
  for await (let val of promises) {
    data.push(val);
  }

  res.status(statusCodes.OK).json({
    success: true,
    data,
  });
});

/*
get favourite movies ids
only fetches ids of favourite movie
if the frontend already has information of favourite movies 
this controller will be usefull
pagination on movies implemented
*/

const getFavouriteMoviesIds=expressAsyncHandler(async (req,res)=>{

  const user = req.user;
  const id = user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 3;

  const movies = await User.aggregate([
    { $match: { _id: id } },
    { $project: { _id: 0, favourites: 1 } },
    { $unwind: "$favourites" },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  const data=movies.map((element)=>{
    return element.favourites;
  })
  res.status(statusCodes.OK).json({
    success:true,
    data
  })
})

//adds the favourite movie
const addFavouriteMovie = expressAsyncHandler(async (req, res) => {

    const {movie_id}=req.body;
    if(!movie_id){
        throw new CustomError(statusCodes.BAD_REQUEST,"Movie Id Required");
    }


    const user_id=req.user._id;
    const user=await User.findById(user_id)


    if(user.favourites && user.favourites.includes(movie_id)){
        throw new CustomError(statusCodes.BAD_REQUEST,`Movie with movie_id ${movie_id} Is Already added to favourite`);
    }
    user.favourites.push(movie_id);
    await user.save();
   
    res.status(statusCodes.CREATED).json({
        success:true,
        data:{
            message:`Movie with movie_id ${movie_id} added to favourite movies`
        }
    });

});

//remove movie from favourites
const removeFavouriteMovie = expressAsyncHandler(async (req, res) => {
    const {movie_id}=req.body;
    if(!movie_id){
        throw new CustomError(statusCodes.BAD_REQUEST,"Movie Id Required");
    }


    const user_id=req.user._id;
    const user=await User.findById(user_id)


    if(!user.favourites || !user.favourites.includes(movie_id)){
        throw new CustomError(statusCodes.BAD_REQUEST,`Movie with movie_id ${movie_id} Is Not present in the favourites`);
    }
    user.favourites.pull(movie_id);
    await user.save();
   
    res.status(statusCodes.CREATED).json({
        success:true,
        data:{
            message:`Movie with movie_id ${movie_id} removed from favourite movies`
        }
    });
});




module.exports = {
  getFavouriteMovies,
  getFavouriteMoviesIds,
  addFavouriteMovie,
  removeFavouriteMovie,
};
