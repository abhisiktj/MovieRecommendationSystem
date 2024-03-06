const nodeCache = require("node-cache");

const loginOTPCache = new nodeCache({ stdTTL: 10000, checkperiod: 120 });
const resetPasswordOTPCache = new nodeCache({ stdTTL: 10000, checkperiod: 120 });

const setCache = (cache, key, value) => {
  return cache.set(key, value);
};

const getCache = (cache, key) => {
  return cache.get(key);
};

const takeCache = (cache, key) => {
  return cache.take(key);
};

const hasCache = (cache, key) => {
  return cache.has(key);
};

module.exports={
  loginOTPCache,
  resetPasswordOTPCache,
  setCache,
  getCache,
  takeCache,
  hasCache
};
