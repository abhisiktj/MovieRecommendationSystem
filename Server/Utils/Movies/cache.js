/*
Every Query that is sent to tmdb is stored with a counter and a reset value
for some expiry time
if within that expiry time we see that its count is increased from the limit
we reset the expiry time and its count and cache the query data.
After 'N' resets the query is let to complete its api call to get the latest data.
(N can be large as movie data is less likely to vary)
*/

const NodeCache = require('node-cache');

const N=20;
const LIMIT=5;

//stores query as key counter and resets as value
const queryCache=new NodeCache({stdTTL: 1000, checkperiod: 120});
const resultsCache=new NodeCache({stdTTL: 1000, checkperiod: 120});


const queryCaching=(query)=>{
    if(queryCache.has(query)){

        const value=queryCache.get(query);
         if(value.counter+1>LIMIT){
            const newValue={
                counter:0,
                resets:value.resets+1
            }
            if(value.resets==1 || value.resets==N){
                  isSetResults(true);
                 if(value.reses=N)
                  newValue.resets=0;
            }
            queryCache.set(query,newValue);
         }
    }
    else{
        const value={
            counter:1,
            resets:0
        }
        queryCache.set(query,value);
    }

}


const getResults=(query)=>{
    if(resultsCache.has(query))
      return resultsCache.get(query);
}
const isSetResults=(query)=>{
    resultsCache.set(query,true);
}

module.exports={
    queryCaching,
    getResults,
    isSetResults,
    queryCache,
    resultsCache
}