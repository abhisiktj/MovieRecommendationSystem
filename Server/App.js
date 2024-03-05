require("dotenv").config();
const express=require("express");

const connect=require('./config/db');


const app=express();


const port=process.env.port || 8000
const MONGO_URL=process.env.MONGO_URL;

const start=async()=>{
try{
     await connect(MONGO_URL);
     app.listen(port,()=>{
        console.log(`Server running on port ${port}`);
     })
}
catch(error){
    console.log(error);
}
}
start();