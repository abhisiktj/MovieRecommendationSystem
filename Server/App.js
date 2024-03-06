require("dotenv").config();
const express=require("express");
const csvToDB=require('./Utils/Movies/csvToDb');
  
const connect=require('./Config/db');

//imprting models
const Movie=require('./Models/movie');

//importing Routers
const userRouter=require('./Routes/user');

//importing Error Handler

const {notFound,errorHandler}=require('./Middlewares/error');

const app=express();

app.use(express.json());

app.use('/api/v1/user',userRouter);

app.use(notFound);
app.use(errorHandler);
const port=process.env.port || 8000
const MONGO_URL=process.env.MONGO_URL;

const start=async()=>{
try{
     await connect(MONGO_URL);
     /*
     Drops the Movies collections
     Adds csv file to movies collection whenever server is started
     */
     Movie.collection.drop();
     await csvToDB(__dirname);
     app.listen(port,()=>{
        console.log(`Server running on port ${port}`);
     })
}
catch(error){
    console.log(error);
}
}
start();