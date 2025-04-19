const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../model/adminModel");
const sendToken = require("../utils/jwtToken");

exports.adminRegister = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  // Check if the user already exists with the same email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHander("User with this email already exists", 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    confirmPassword,
    role: "Admin", // Automatically assign Admin role
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully.',
    user,
  });
});


// Admin Login with MFA Verification
exports.adminLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email, password, and mfaToken are provided
  if (!email || !password ) {
    return next(new ErrorHander("Please enter email, password, and MFA token", 400));
  }

  // Find user by email
  const user = await User.findOne({ email }).select("+password +mfaSecret");

  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  // Check if password matches
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});


exports.logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
       expires:new Date(Date.now()),
       httpOnly:true,
    });
  
    res.status(200).json({
       success:true,
       message:"Logged Out",
    });
  });


exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
 
    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }
  
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
     user.activityLogs("forgot password")
    try {
      await sendEmail({
        email: user.email,
        subject: `Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHander(error.message, 500));
    }
  });
  // Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new ErrorHander("Reset Password Token is invalid or has been expired", 400));
    }
  
    // Validate new password and confirm password
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHander("Passwords do not match", 400));
    }
  
    // Check password strength (optional security check)
    const passwordStrength = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordStrength.test(req.body.password)) {
      return next(new ErrorHander("Password must be at least 6 characters long and contain at least one letter and one number.", 400));
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
  
    sendToken(user, 200, res); // Assuming you have sendToken function for sending JWT token
  });
  
// Update Preferences