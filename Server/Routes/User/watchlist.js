const express = require("express");

const {watchlistController}= require("../../Controllers/index");
const{
    getWatchlist, addToWatchList, deleteFromWatchList, updateEntryInWatchList,createWatchlist,togglePrivate
}=watchlistController

const auth = require("../../Middlewares/auth");


const watchlistRouter = express.Router();


watchlistRouter.post('/',auth,createWatchlist);
watchlistRouter.get('/:userId',getWatchlist);
watchlistRouter.post("/:movieId",auth,addToWatchList);
watchlistRouter.delete('/:entryId',auth,deleteFromWatchList);
watchlistRouter.patch('/:entryId',auth,updateEntryInWatchList);
watchlistRouter.patch('/toggle/private',auth,togglePrivate)
module.exports = {watchlistRouter};
