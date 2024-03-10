const express = require("express");

const {apiController}= require("../../Controllers/index");
const{
    getMoviesByNameController,
    getMoviesController,
    getMovieDetailsController,
    getCreditsFromMovieId,
    getReviewsFromMovieId
}=apiController

const auth = require("../../Middlewares/auth");

const apiRouter = express.Router();

//unauthorized routes
apiRouter.get("/",getMoviesByNameController);
apiRouter.get("/movies",getMoviesController);
apiRouter.get("/:movie_id",getMovieDetailsController);
apiRouter.get("/credits/:movie_id",getCreditsFromMovieId);
apiRouter.get("/reviews/:movie_id",getReviewsFromMovieId);


module.exports = {apiRouter};
