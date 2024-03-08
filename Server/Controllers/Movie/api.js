/*
Controllers for tmdb api calls
*/


const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");


const {getMovies,getMovieDetails} = require("../../Utils/Movies/tmdb");
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

module.exports = {
  getMoviesController,
  getMovieDetailsController,
};
