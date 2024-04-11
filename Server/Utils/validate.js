/*
validator functions for various schemas
*/

const validator=require('validator');
const validateMongoId=((id)=>{
    return validator.isMongoId(id)
})

const  validateEmail=(email) =>{
    // Regular expression pattern for email validation
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (pattern.test(email)) {
        return true;
    } else {
        return false;
    }
}
const  validatePassword=(password)=> {
  
    if (password.length < 8) {
        return false;
    }

    var hasUpperCase = false;
    var hasLowerCase = false;
    var hasDigit = false;
    var hasSpecialChar = false;


    for (var i = 0; i < password.length; i++) {
        var char = password.charAt(i);

        if (char >= 'A' && char <= 'Z') {
            hasUpperCase = true;
        }
        if (char >= 'a' && char <= 'z') {
            hasLowerCase = true;
        }
        if (char >= '0' && char <= '9') {
            hasDigit = true;
        }
        if ('!@#$%^&*()'.indexOf(char) !== -1) {
            hasSpecialChar = true;
        }
    }


    if (hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar) {
        return true;
    } else {
        return false;
    }
}

module.exports={
    validateMongoId,
    validateEmail,
    validatePassword
}