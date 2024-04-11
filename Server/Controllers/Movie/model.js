const expressAsyncHandler=require('express-async-handler')
const axios=require('axios');


const recommendMovieController=expressAsyncHandler((req,res)=>{

     const {title}=req.body;
    const url=process.env.model_url;
    //do api call to model

    res.json({
        success:true,
        data
    })
});

const analyseSentimentController=expressAsyncHandler((req,res)=>{
    const {review}=req.body;
     //do api call to model to analyse the review

     res.json({
        success:true,
        data
     })
});


module.exports={
    recommendMovieController,
    analyseSentimentController
}