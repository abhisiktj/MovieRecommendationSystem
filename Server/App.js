require("dotenv").config();
const cors=require('cors');
const http=require('http');
const express=require("express");

const connect=require('./Config/db');




//importing Routers
const {authRouter,apiRouter,userMovieRouter,watchlistRouter}=require('./Routes/index');

//importing Error Handler
const {notFound,errorHandler}=require('./Middlewares/error');
const searchUsingSockets= require("./Utils/Movies/searchUsingSockets");
const rateLimitMiddleware = require("./Middlewares/rateLimit");

const app=express();
const server = http.createServer(app);

app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );

app.use(rateLimitMiddleware);
app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.use('/api/v1/user/auth',authRouter);
app.use('/api/v1/user/movie',userMovieRouter);
app.use('/api/v1/user/watchlist/',watchlistRouter);
app.use('/api/v1/movie/api',apiRouter);


app.use(notFound);
app.use(errorHandler);
const port=process.env.port || 8000
const MONGO_URL=process.env.MONGO_URL;

const start=async()=>{
try{
     await connect(MONGO_URL);
     searchUsingSockets(server);
     server.listen(port,()=>{
        console.log(`Server running on port ${port}`);
     })
}
catch(error){
    console.log(error);
}
}
start();