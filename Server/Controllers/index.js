const {
    registerUser,
    loginUser,
    changePassword,
    forgetPassword,
    resetPassword,
    toggletwofa,
    otpTwoFAUser,
    loginTwoFA
}=require('./User/auth');


module.exports=require('./User/auth');