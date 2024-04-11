const express=require('express');
const {modelController}=require('../../Controllers/index');
const{
    recommendMovieController,
    analyseSentimentController
}=modelController

const modelRouter=express.Router();

modelRouter.post('/recommend',recommendMovieController);
modelRouter.post('/sentiment',analyseSentimentController);

module.exports={
    modelRouter
}