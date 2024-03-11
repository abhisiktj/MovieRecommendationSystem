/*
deprecated
*/


const Path = require("path");
const csv = require("csvtojson");
// const Movie=require('..//../Models/movie');


const csvToDB = async (path) => {
  const csvFilePath = Path.resolve(path, "Static", "main_data.csv");
  const jsonArray = await csv().fromFile(csvFilePath);
  jsonArray.forEach(async (movie)=>{

        let director_name=movie.director_name;
        let actors=[movie.actor_1_name,movie.actor_2_name,movie.actor_3_name];
        let genres=movie.genres.split(" ");
        let movie_title=movie.movie_title;

       

        const newMovie=await Movie.create({
          director_name,
          actors,
          genres,
          movie_title
        })
  
  })
};

module.exports = csvToDB;
