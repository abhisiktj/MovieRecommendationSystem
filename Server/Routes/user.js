const express=require('express');

const {registerUser, loginUser,changePassword}=require('../Controllers/user');
const auth=require('../Middlewares/auth');

const router=express.Router();

//unauthorized routes
router.post('/register',registerUser);
router.post('/login',loginUser);

//authorized routes
router.post('/password/change',auth,changePassword);


module.exports=router;
