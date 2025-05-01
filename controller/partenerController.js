const Partner = require("../model/partenerModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
//create partener 
exports.createPartner = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName,  businessName, country, state,email, phone, password, confirmPassword } = req.body;

  // Basic validation
  if (!firstName || !lastName  || !phone || !password || !confirmPassword) {
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
  const existingClient = await Partner.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingClient) {
    return next(new ErrorHandler("Client with this email or phone already exists", 400));
  }

  // Create new client
  const client = await Partner.create({
    firstName,
    lastName,
    email,
    phone,
    businessName, country, state,
    password,
    confirmPassword,
    role:"partner"
  });

  res.status(201).json({
    success: true,
    message: "Client registered successfully",
    client
  });
});

exports.partenerLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const client = await Partner.findOne({ email }).select("+password");
  console.log("Client:", client);


  if (!client) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await client.comparePassword(password);
  console.log("Password matched?", isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(client, 200, res);
});


// Get All Partners
exports.getAllPartners = catchAsyncErrors(async (req, res, next) => {
  const partners = await Partner.find();
  res.status(200).json({ success: true, partners });
});

// Update Partner
exports.updatePartner = catchAsyncErrors(async (req, res, next) => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!partner) {
    return next(new ErrorHandler("Partner not found", 404));
  }

  res.status(200).json({ success: true, message: "Partner updated", partner });
});

// Delete Partner
exports.deletePartner = catchAsyncErrors(async (req, res, next) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);

  if (!partner) {
    return next(new ErrorHandler("Partner not found", 404));
  }

  res.status(200).json({ success: true, message: "Partner deleted" });
});



// Forgot Password - Partner
exports.forgotPasswordPartner = catchAsyncErrors(async (req, res, next) => {
  const partner = await Partner.findOne({ email: req.body.email });

  if (!partner) {
    return next(new ErrorHandler("Partner not found", 404));
  }

  const resetToken = partner.getResetPasswordToken();
  await partner.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/partner/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you did not request this, please ignore.`;

  try {
    await sendEmail({
      email: partner.email,
      subject: `Partner Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${partner.email} successfully`,
    });
  } catch (error) {
    partner.resetPasswordToken = undefined;
    partner.resetPasswordExpire = undefined;
    await partner.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});


// Reset Password - Client
// Reset Password - Partner
exports.resetPasswordPartner = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const partner = await Partner.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!partner) {
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

  partner.password = req.body.password;
  partner.resetPasswordToken = undefined;
  partner.resetPasswordExpire = undefined;

  await partner.save();

  sendToken(partner, 200, res);
});


// Logout - Partner
exports.logoutPartner = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
