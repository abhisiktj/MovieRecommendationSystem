const express=require('express');

const {registerUser, loginUser,changePassword, forgetPassword}=require('../Controllers/user');
const auth=require('../Middlewares/auth');

const router=express.Router();

//unauthorized routes
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/password/forget',forgetPassword);

//authorized routes
router.post('/password/change',auth,changePassword);



module.exports=router;
