const Freelancer = require("../model/frelancerModel");
const Portfolio = require("../model/portfolioModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
const sendToken = require("../utils/jwtToken"); 
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.createfrelancer = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, businessName, country, state, email, phone, password, confirmPassword } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Check password match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

   // Validate country and state
   const countryStates = {
    India: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
      "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
      "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ],
    Germany: [
      "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", 
      "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", 
      "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", 
      "Schleswig-Holstein", "Thuringia"
    ],
    Australia: [
      "New South Wales", "Queensland", "South Australia", "Tasmania", 
      "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"
    ]
  };

  // Check if the state is valid for the given country
  if (!countryStates[country] || !countryStates[country].includes(state)) {
    return next(new ErrorHandler('Invalid state for the selected country', 400));
  }


  // Check if client already exists
  const existingClient = await Freelancer.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingClient) {
    return next(new ErrorHandler("Client with this email or phone already exists", 400));
  }

  // Create new client
  const client = await Freelancer.create({
    firstName,
    lastName,
    email,
    phone,
    businessName, country, state,
    password,
    confirmPassword,
    role:"Freelancer"
  });

  res.status(201).json({
    success: true,
    message: "Client registered successfully",
    client
  });
});


exports.freelancerLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find freelancer by email
  const freelancer = await Freelancer.findOne({ email }).select("+password");
  console.log("Freelancer:", freelancer); // Debugging line to check freelancer data

  if (!freelancer) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Compare password
  const isPasswordMatched = await freelancer.comparePassword(password);
  console.log("Password matched?", isPasswordMatched); // Debugging line to check password comparison

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Generate JWT token and send response
  sendToken(freelancer, 200, res);
});

// Get All Freelancers
exports.getAllFreelancers = catchAsyncErrors(async (req, res, next) => {
  const freelancers = await Freelancer.find().populate("accountManager", "name email");
  res.status(200).json({ success: true, freelancers });
});

// Update Freelancer
exports.updateFreelancer = catchAsyncErrors(async (req, res, next) => {
  const updateData = { ...req.body };

  // Remove sensitive fields from update
  delete updateData.email;
  delete updateData.phone;
  delete updateData.password;

  // Find freelancer and update
  const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // If freelancer is not found, return an error
  if (!freelancer) {
    return next(new ErrorHandler("Freelancer not found", 404));
  }

  // Send success response
  res.status(200).json({
    success: true,
    message: "Freelancer updated successfully",
    freelancer,
  });
});


// Delete Freelancer
exports.deleteFreelancer = catchAsyncErrors(async (req, res, next) => {
  const freelancer = await Freelancer.findByIdAndDelete(req.params.id);
  if (!freelancer) {
    return next(new ErrorHandler("Freelancer not found", 404));
  }

  res.status(200).json({ success: true, message: "Freelancer deleted successfully" });
});


exports.forgotPasswordFreelancer = catchAsyncErrors(async (req, res, next) => {
  const freelancer = await Freelancer.findOne({ email: req.body.email });

  if (!freelancer) {
    return next(new ErrorHandler("Freelancer not found", 404));
  }

  const resetToken = freelancer.getResetPasswordToken();
  await freelancer.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/freelancer/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you did not request this, please ignore.`;

  try {
    await sendEmail({
      email: freelancer.email,
      subject: `Freelancer Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${freelancer.email} successfully`,
    });
  } catch (error) {
    freelancer.resetPasswordToken = undefined;
    freelancer.resetPasswordExpire = undefined;
    await freelancer.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});


// Reset Password - Client
exports.resetPasswordFreelancer = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const freelancer = await Freelancer.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!freelancer) {
    return next(new ErrorHandler("Reset token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const passwordStrength = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passwordStrength.test(req.body.password)) {
    return next(
      new ErrorHandler(
        "Password must be at least 6 characters and include one letter and one number.",
        400
      )
    );
  }

  freelancer.password = req.body.password;
  freelancer.resetPasswordToken = undefined;
  freelancer.resetPasswordExpire = undefined;

  await freelancer.save();

  sendToken(freelancer, 200, res);
});

exports.logoutfrelancer = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Submit Portfolio
exports.submitPortfolio = catchAsyncErrors(async (req, res, next) => {
  const { freelancerId, projectTitle, description, type, link, image, video } = req.body;

  const portfolio = await Portfolio.create({
    freelancerId,
    projectTitle,
    description,
    type,
    link,
    image,
    video,
  });

  res.status(201).json({ success: true, portfolio });
});

// Approve/Reject Portfolio
exports.updatePortfolioStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid portfolio status", 400));
  }

  const portfolio = await Portfolio.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!portfolio) {
    return next(new ErrorHandler("Portfolio not found", 404));
  }

  res.status(200).json({ success: true, message: `Portfolio ${status}`, portfolio });
});
