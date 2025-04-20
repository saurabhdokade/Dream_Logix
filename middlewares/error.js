const ErrorHandler = require("../utils/errorhandler");
     
module.exports = (err,req,res,next) => {
 err.statusCode = err.statusCode || 500 ;
 err.message = err.message || "Internal Server Error";


 //wrong Mongodb Id error 
 if(err.name === "CastError"){
  const message = `Resource not found. Inavalid: ${err.path}`;
  err = new ErrorHandler(message,400);
}

//Mongoose duplicate key error
if(err.code === 11000){
  const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
  err = new ErrorHandler(message,400);
}

 //wrong JWT error 
 if(err.name === "JsonWebTokenError"){
  const message = `Json Web Token is invalid, try again `;
  err = new ErrorHandler(message,400);
 }


 //JWT EXPIRE ERROR 
 if(err.name === "TokenExpiredError"){
  const message = `Json Web Token isExpired, try again `;
  err = new ErrorHandler(message,400);
 }


  res.status(err.statusCode).json({
    success:false,
    message:err.stack,
  });
};