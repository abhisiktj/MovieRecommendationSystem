const {authRouter}=require('./User/auth');
const {userMovieRouter}=require('./User/movie')
const {apiRouter}=require('./Movie/api');
const {watchlistRouter}=require('./User/watchlist');
const { modelRouter } = require('./Movie/model');









module.exports={
    authRouter,
    apiRouter,
    userMovieRouter,
    watchlistRouter,
    modelRouter
}