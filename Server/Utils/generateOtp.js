const crypto = require('crypto');

const generateTOTP = (timeStep = 30, tokenLength = 6) => {

    const length=20;
    const secret=crypto.randomBytes(length).toString('base64');
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32LE();
     
    
    // Get the current time and add the random value
    const currentTime = Math.floor(Date.now() / 1000) + randomValue;
    const timeCounter = Math.floor(currentTime / timeStep);
    const timeBuffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
        timeBuffer.writeUInt8(timeCounter >> (i * 8) & 0xff, i);
    }

    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const otpBinary =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);
    const otp = otpBinary % Math.pow(10, tokenLength);
    return otp.toString().padStart(tokenLength, '0');
};



module.exports={generateTOTP};



