// tmdb api service

const axios = require("axios");
const { resultsCache } = require("./cache");
const api_key = process.env.tmdb_api_key;



const axiosGetHelper=async(url)=>{
  if(resultsCache.has(url)!=true){
    return resultsCache.get(url);
  }


  const promise= new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url);
      if(resultsCache.has(url ) && resultsCache.get(url)==true)
        resultsCache.set(url,response.data);
      
      resolve(response.data);
    } catch (e) {
      resolve(false);
    }
  });
  
}

const getMovies = async (queries) => {
  const base_url = "https://api.themoviedb.org/3/discover/movie";

  const with_genres = queries?.with_genres?.splits("AND") || undefined;
  const with_cast = queries?.with_cast?.split("AND") || undefined;

  let include_adult = `include_adult=false`;
  let include_video = `include_video=false`;
  let page = `page=1`;
  let language = `language=en-US`;
  let sort_by = `sort_by=popularity.desc`;

  if (queries.include_adult === "true") include_adult = `include_adult=true`;

  if (queries.page) page = `page=${queries.page}`;

  if (queries.language) language = `language=${queries.language}`;

  if (queries.sort_by) sort_by = `sort_by=${queries.sort_by}`;

  const optionalQueries = {
    primary_release_year: queries.primary_release_year,
    with_genres: with_genres,
    with_cast: with_cast,
    "primary_release_date.gte":
      queries.primary_release_year === undefined
        ? queries.primary_release_date_gte
        : undefined,
    "primary_release_date.lte":
      queries.primary_release_year === undefined
        ? queries.primary_release_date_lte
        : undefined,
  };

  let keys = Object.keys(optionalQueries);
  let url = `${base_url}?api_key=${api_key}`;
  url += `&${include_adult}&${include_video}&${page}&${language}&${sort_by}`;

  keys.forEach((key) => {
    if (optionalQueries[`${key}`] !== undefined)
      if (key == "with_genres" || key == "with_cast") {
        const value = optionalQueries[key].join(",");
        url += `&${key}=${value}`;
      } else url += `&${key}=${optionalQueries[`${key}`]}`;
  });

   return await axiosGetHelper(url);
};

const getMovieDetails = async (movie_id) => {
  const url = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}`;
  return await axiosGetHelper(url);
};

const getCredits = async (movie_id) => {
  const url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${api_key}&language=en-US`;
  return await axiosGetHelper(url);
};

const getReviews=async( movie_id)=>{
  const url=`https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=${api_key}`
  console.log(url);
  return await axiosGetHelper(url);
}

//for Search Functionality
const getMoviesByName=async(query,page)=>{
  const url=`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${query}&include_adult=false&language=en-US&page=${page}`;
  console.log(url);
  return await axiosGetHelper(url);
}

module.exports = { getMovies, getMovieDetails, getCredits,getReviews,getMoviesByName };


