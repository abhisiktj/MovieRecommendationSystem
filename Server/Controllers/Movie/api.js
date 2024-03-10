/*
Controllers for tmdb api calls
*/


const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");


const {getMovies,getMovieDetails,getCredits,getReviews,getMoviesByName} = require("../../Utils/Movies/tmdb");
const CustomError=require('../../Utils/customError');

const getMoviesController = expressAsyncHandler(async (req, res) => {
  const apiData=await getMovies(req.query);
  if(!apiData)
    throw new CustomError(StatusCodes.NOT_FOUND,"Requested Resource Not Available");

  res.status(StatusCodes.OK).json(apiData);
});

const getMovieDetailsController = expressAsyncHandler(async(req, res) => {
  const {movie_id}=req.params;
  const apiData=await getMovieDetails(movie_id);

  if(!apiData)
    throw new CustomError(StatusCodes.NOT_FOUND,"Requested Resource Not Available");

   res.status(StatusCodes.OK).json(apiData);
});

//for search functionality
const getMoviesByNameController=expressAsyncHandler(async(req,res)=>{
   const {query,page}=req.query;
   if(!page)
     page=1;
  const data=await getMoviesByName(query,page);
  if(!data){
    throw new CustomError(StatusCodes.NOT_FOUND,"Unable to fetch data");
  }
  res.status(StatusCodes.OK).json(data);
})

const getCreditsFromMovieId=expressAsyncHandler(async(req,res)=>{
  const {movie_id}=req.params

  const data=await getCredits(movie_id);
  if(!data){
    throw new CustomError(StatusCodes.NOT_FOUND,"Unable to fetch data");
  }
  res.status(StatusCodes.OK).json(data);
})

const getReviewsFromMovieId=expressAsyncHandler(async(req,res)=>{
  const {movie_id}=req.params

  const data=await getReviews(movie_id);
  if(!data){
    throw new CustomError(StatusCodes.NOT_FOUND,"Unable to fetch data");
  }
  res.status(StatusCodes.OK).json(data);
})


module.exports = {
  getMoviesController,
  getMovieDetailsController,
  getCreditsFromMovieId,
  getReviewsFromMovieId,
  getMoviesByNameController
};

