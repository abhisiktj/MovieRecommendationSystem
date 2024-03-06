require("dotenv").config();
const express=require("express");
const csvToDB=require('./Utils/Movies/csvToDb');
  
const connect=require('./Config/db');

//importing Routers
const userRouter=require('./Routes/user');

//importing Error Handler
const errorHandler=require('./Middlewares/error');

const app=express();

app.use(express.json());

app.use('/api/v1/user',userRouter);

app.use(errorHandler);
const port=process.env.port || 8000
const MONGO_URL=process.env.MONGO_URL;

const start=async()=>{
try{
     await connect(MONGO_URL);
     //Adds csv file to movie db whenever server is started
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