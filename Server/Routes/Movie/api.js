const express = require("express");

const {apiController}= require("../../Controllers/index");
const{
    getMoviesController,
    getMovieDetailsController
}=apiController

const auth = require("../../Middlewares/auth");

const apiRouter = express.Router();

//unauthorized routes
apiRouter.get("/movies",getMoviesController);
apiRouter.get("/:movie_id",getMovieDetailsController);
module.exports = {apiRouter};
