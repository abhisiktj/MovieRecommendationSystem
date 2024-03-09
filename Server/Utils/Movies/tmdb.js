// tmdb api service


const axios=require('axios');
const api_key = process.env.tmdb_api_key;

const getMovies=async(queries)=>{
    const base_url = "https://api.themoviedb.org/3/discover/movie";


    const with_genres=queries?.with_genres?.splits('AND') || undefined;
    const with_cast=queries?.with_cast?.split('AND') || undefined;

  
    let include_adult=`include_adult=false`;
    let include_video=`include_video=false`;
    let page=`page=1`;
    let language=`language=en-US`;
    let sort_by=`sort_by=popularity.desc`;
      
    if(queries.include_adult==="true")
      include_adult=`include_adult=true`;

    if(queries.page)
      page=`page=${queries.page}`;

    if(queries.language)
      language=`language=${queries.language}`;

    if(queries.sort_by)
      sort_by=`sort_by=${queries.sort_by}`;

    const optionalQueries={
        "primary_release_year":queries.primary_release_year,
        "with_genres":with_genres,
        "with_cast":with_cast,
        "primary_release_date.gte":(queries.primary_release_year===undefined)?queries.primary_release_date_gte :undefined,
        "primary_release_date.lte":(queries.primary_release_year===undefined)?queries.primary_release_date_lte :undefined
    }

    let keys=Object.keys(optionalQueries);
    let url=`${base_url}?api_key=${api_key}`;
    url+=`&${include_adult}&${include_video}&${page}&${language}&${sort_by}`;

    keys.forEach((key)=>{
       if(optionalQueries[`${key}`]!==undefined)
         if(key=="with_genres" || key=="with_cast"){
              const value=optionalQueries[key].join(',');
              url+=`&${key}=${value}`;
         }
         else
         url+=`&${key}=${optionalQueries[`${key}`]}`

    })



    return new Promise(async(resolve,reject)=>{
        try{
            const response=await axios.get(url);
              resolve(response.data);
            }
            catch(e){
                resolve(false);
            }
    })
}

const getMovieDetails=async(movie_id)=>{
  console.log(movie_id);
    const url=`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}`;

   return new Promise(async(resolve,reject)=>{
     try {
        const response=await axios.get(url);
        resolve(response.data);
     } catch (error) {
      console.log(error.status_message);
        resolve(false);
     }
   })
      
}

module.exports={getMovies,getMovieDetails};



