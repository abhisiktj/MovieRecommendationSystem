/*
controller for watchlist
*/

//importing npm packages
const expressAsyncHandler=require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const mongoose=require('mongoose');

//importing utils
const {validateMongoId}=require('../../Utils/validate');
const CustomError = require('../../Utils/customError');


//importing models
const Watchlist=require('../../Models/watchlist');
const User=require('../../Models/user');



//constants
const statusArray=["watched", "watching", "dropped", "plan to watch"];

//creates a watchlist
const createWatchlist=expressAsyncHandler(async(req,res)=>{
    const user=req.user;
    const user_id=user._id;
    if(user.watchlist)
      throw new CustomError(StatusCodes.BAD_REQUEST,"Watchlist for user already exists");

    const watchlist=new Watchlist();
    user.watchlist=watchlist._id;
    await user.save();
    await watchlist.save();
    
    
    res.status(StatusCodes.CREATED).json({
        success:true,
        data:{
             watchlist_id:watchlist._id
        }
    })

})

/*
   returns the watchlist of a user
   supports paginated queries
*/
const getWatchlist=expressAsyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!validateMongoId(userId))
      throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid User Id");

     const user=await User.findById(userId).select('watchlist');
     if(!user)
       throw new CustomError(StatusCodes.NOT_FOUND,"No user with given Id");

    const page=req.query.page ||1;
    const limit=req.query.limit ||3

    const watchlist_id=user.watchlist;
    if(!watchlist_id)
      throw new CustomError(StatusCodes.NOT_FOUND,"No watchlist found for this user");

   
    const aggregationPipeline = [
        { $match: { _id: watchlist_id } },
        {
            $project: {
                private : 1,
                entries: 1,
            }
        },
        {
            $skip: (page - 1) * page // Skip documents based on pagination
        },
        {
            $limit: limit // Limit the number of documents per page
        }
    ];
    const watchlist=await Watchlist.aggregate(aggregationPipeline);
   
    res.status(StatusCodes.OK).json({
        success:true,
        data:{
            watchlist
        }
    })
    
    

})

//add an entry to watchlist
const addToWatchList=expressAsyncHandler(async(req,res)=>{

    const user=req.user;
     const{movieId}=req.params;
     if(!movieId)
       throw new CustomError(StatusCodes.BAD_REQUEST,"MovieId is required");

     const {rating,status}=req.body;
     if(rating){
     if(isNaN(rating)){
        throw new CustomError(StatusCodes.BAD_REQUEST,"Only number entry allowed as rating");
     }    
    
     if(!(Number(rating)<=10) || !(Number(rating)>=0)){
        throw new  CustomError(StatusCodes.BAD_REQUEST,"Give a valid rating between 0 and 10");
     }
    }

    if(status){ 
        if(!statusArray.includes(status)){
              throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid status")
        }
    }

     

     let watchlistId=user.watchlist;
     let watchlist;
     if(!watchlistId){
        watchlist=new Watchlist();
        user.watchlist=watchlist._id;
        await user.save();
        await watchlist.save();
        watchlistId=watchlist._id;
     }
     else{
           watchlist=await Watchlist.findById(watchlistId); 
     }

     const entry={}
     entry.movie_id=movieId;
     if(rating)
       entry.rating=Number(rating);

     if(status)
       entry.status=status;

       const foundEntry=await Watchlist.findOne({'entries.movie_id':movieId});
       if(foundEntry)
         throw new CustomError(StatusCodes.BAD_REQUEST,`Movie with id ${movieId} already present in the watchlist`);
     
     entry._id=new mongoose.Types.ObjectId();
     const entryId=entry._id;
     watchlist.entries.push(entry);
     await watchlist.save();

     res.status(StatusCodes.CREATED).json({
        success:true,
        data:{
            message:"Added to watchlist",
            watchlistId,
            entryId
        }
     });
})

/*
deletes an entry from watchlist
based on watchlistId
*/
const deleteFromWatchList=expressAsyncHandler(async(req,res)=>{
    
    const user=req.user;
    const watchlistId=user.watchlist;

    if(!watchlistId)
      throw new CustomError(StatusCodes.BAD_REQUEST,"No watchlist found for this user");

    const {entryId}=req.params;

    if(!validateMongoId(entryId))
      throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid Mongo id for entryId");

      const watchlist = await Watchlist.findById(watchlistId);

      const index = watchlist.entries.findIndex((entry) => {
       return entry._id.toString() === entryId
    });
        if (index === -1) {
            throw new CustomError(StatusCodes.NOT_FOUND,`No entry with id ${entryId} found for wathclist with id ${watchlistId}`);
        }

        // Remove the entry from the entries array
        watchlist.entries.splice(index, 1);
        await watchlist.save();

    res.status(StatusCodes.NO_CONTENT).json({
        success:true,
        message:`Entry deleted for entry id ${entryId}`
    });

})

//updates an entry in watchlist
const updateEntryInWatchList=expressAsyncHandler(async(req,res)=>{
    const user=req.user;
    const watchlistId=user.watchlist;

    if(!watchlistId)
      throw new CustomError(StatusCodes.BAD_REQUEST,"No watchlist found for this user");

    const {entryId}=req.params;

    if(!validateMongoId(entryId))
      throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid Mongo id for entryId");

      const{rating ,status}=req.body;

      if(!rating && !status){
          throw new CustomError(StatusCodes.BAD_REQUEST,"Give rating or an status to update");
      }

      const watchlist = await Watchlist.findById(watchlistId);

      const index = watchlist.entries.findIndex((entry) => {
       return entry._id.toString() === entryId
    });
    if (index === -1) {
        throw new CustomError(StatusCodes.NOT_FOUND,`No entry with id ${entryId} found for watchlist with id ${watchlistId}`);
    }
      
        
        let updatedEntry={};
        
        if(rating){
            if(isNaN(rating)){
               throw new CustomError(StatusCodes.BAD_REQUEST,"Only number entry allowed as rating");
            }
            if(!(Number(rating)<=10) || !(Number(rating)>=0)){
                throw new  CustomError(StatusCodes.BAD_REQUEST,"Give a valid rating between 0 and 10");
             }
             if(!(Number(rating)===watchlist.entries[index].rating))
                 updatedEntry.rating=rating;
        }
        if(status){ 
        if(!statusArray.includes(status)){
              throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid status")
        }
        if(!(status===watchlist.entries[index].status))
           updatedEntry.status= status ;
    }
        
        if( Object.keys(updatedEntry).length === 0)
          throw new CustomError(StatusCodes.BAD_REQUEST,"Provide field with new values to update");

        Object.assign(watchlist.entries[index], updatedEntry);
        const updatedWatchlist=await watchlist.save();
        const newEntry=updatedWatchlist.entries[index]

      res.status(StatusCodes.OK).json({
          success:true,
          data:{
            entry:newEntry
          }
      })
});


//toggles the private field of watchlist
const togglePrivate=expressAsyncHandler(async(req,res)=>{
    const user=req.user;
  const watchlistId=user.watchlist;

  const {private}=req.body;
  
  if(!["true","false"].includes(private)){
    throw new CustomError(StatusCodes.BAD_REQUEST,"Invalid request for private");
  }

  const watchlist=await Watchlist.findById(watchlistId);
  if(private===watchlist.private.toString()){
    throw new CustomError(StatusCodes.BAD_REQUEST,`private value is alrady ${private}`);
  }
   
   if(private==='true')
     watchlist.private=true;
   
   else if(private==='false')
     watchlist.private=false;

   await watchlist.save();

  res.status(StatusCodes.OK).json({
    success:true,
    data:{
        message:`Successfully changed private value to ${private}`
    }
  })
  
});

module.exports={
    getWatchlist,
    addToWatchList,
    deleteFromWatchList,
    updateEntryInWatchList,
    createWatchlist,
    togglePrivate
}