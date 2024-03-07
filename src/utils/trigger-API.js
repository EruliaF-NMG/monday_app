const fetch = require("node-fetch");
const { apiEndpoint,apiToken } = require('../config/core.config');

/**
 * trigger GraphQL API
 * @param {string} query 
 * @returns 
 */
const triggerAPI= async (query)=>{
  try{
    let results = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization" : apiToken
      },

      body: JSON.stringify({ query })
    })
  const responce = await results.json();
  return responce.data;
  } catch (error) {
    console.error("api----ERROR----",error);
    return {};
  }
}

module.exports = triggerAPI;