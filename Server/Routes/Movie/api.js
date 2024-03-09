const express = require("express");

const {apiController}= require("../../Controllers/index");
const{
    getMoviesController,
    getMovieDetailsController,
    getCreditsFromMovieId
}=apiController

const auth = require("../../Middlewares/auth");

const apiRouter = express.Router();

//unauthorized routes
apiRouter.get("/movies",getMoviesController);
apiRouter.get("/:movie_id",getMovieDetailsController);
apiRouter.get("/credits/:movie_id",getCreditsFromMovieId);

module.exports = {apiRouter};
