const express = require("express");

const {userMovieController}= require("../../Controllers/index");
const{
    getFavouriteMovies,
    getFavouriteMoviesIds,
    addFavouriteMovie,
    removeFavouriteMovie,
}=userMovieController

const auth = require("../../Middlewares/auth");
const user = require("../../Models/user");

const userMovieRouter = express.Router();

//authorized routes
userMovieRouter.get("/",auth,getFavouriteMovies);
userMovieRouter.get("/ids",auth,getFavouriteMoviesIds);
userMovieRouter.post("/",auth,addFavouriteMovie);
userMovieRouter.delete("/",auth,removeFavouriteMovie);


module.exports = {userMovieRouter};
