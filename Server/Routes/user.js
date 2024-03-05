const express=require('express');

const {registerUser, loginUser}=require('../Controllers/user');
const router=express.Router();


//unauthorized routes
router.post('/register',registerUser);
router.post('/login',loginUser);



module.exports=router;
