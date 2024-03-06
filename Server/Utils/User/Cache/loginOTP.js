const nodeCache=require('node-cache');

const loginOTPCache=new nodeCache({ stdTTL: 1000, checkperiod: 120 });

const set=(key,value)=>{
    return loginOTPCache.set(key,value);
}

const get=(key)=>{
    return loginOTPCache.get(key);
}

const take=(key)=>{
    return loginOTPCache.take(key);
}

const has=(key)=>{
    return loginOTPCache.has(key);
}

module.exports={set,get,take,has};