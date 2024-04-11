const authController=require('./User/auth');
const userMovieController=require('./User/movie');
const watchlistController=require('./User/watchlist');
const apiController=require('./Movie/api');
const modelController=require('./Movie/model')

module.exports={authController,apiController,userMovieController,watchlistController,modelController};