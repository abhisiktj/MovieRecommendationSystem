/*
validator functions for various schemas
*/

const validator=require('validator');

const validateMongoId=((id)=>{
    return validator.isMongoId(id)
})

module.exports={
    validateMongoId
}