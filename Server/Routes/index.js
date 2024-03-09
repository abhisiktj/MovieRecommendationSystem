const {authRouter}=require('./User/auth');
const {userMovieRouter}=require('./User/movie')
const {apiRouter}=require('./Movie/api');









module.exports={
    authRouter,
    apiRouter,
    userMovieRouter
}