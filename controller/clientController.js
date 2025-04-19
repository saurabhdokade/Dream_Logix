const Client = require("../model/clientModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken"); // Utility to send JWT
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt")
const crypto = require("crypto");
// Create Client
exports.createClient = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Check password match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Check if client already exists
  const existingClient = await Client.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingClient) {
    return next(new ErrorHandler("Client with this email or phone already exists", 400));
  }

  // Create new client
  const client = await Client.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role: "Client"
  });

  res.status(201).json({
    success: true,
    message: "Client registered successfully",
    client
  });
});

exports.clientLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const client = await Client.findOne({ email }).select("+password");
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

// Get All Clients
exports.getAllClients = catchAsyncErrors(async (req, res, next) => {
  const clients = await Client.find();
  res.status(200).json({ success: true, clients });
});

// Update Client
// Update Client - exclude email, phone, password
exports.updateClient = catchAsyncErrors(async (req, res, next) => {
  const updateData = { ...req.body };

  // Remove sensitive fields from update
  delete updateData.email;
  delete updateData.phone;
  delete updateData.password;

  const client = await Client.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!client) {
    return next(new ErrorHandler("Client not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Client updated successfully",
    client,
  });
});

// Delete Client
exports.deleteClient = catchAsyncErrors(async (req, res, next) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    return next(new ErrorHandler("Client not found", 404));
  }

  res.status(200).json({ success: true, message: "Client deleted" });
});




// Logout Client
exports.logoutClient = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password - Client
exports.forgotPasswordClient = catchAsyncErrors(async (req, res, next) => {
  const client = await Client.findOne({ email: req.body.email });

  if (!client) {
    return next(new ErrorHandler("Client not found", 404));
  }

  const resetToken = client.getResetPasswordToken();
  await client.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/client/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you did not request this, please ignore.`;

  try {
    await sendEmail({
      email: client.email,
      subject: `Client Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${client.email} successfully`,
    });
  } catch (error) {
    client.resetPasswordToken = undefined;
    client.resetPasswordExpire = undefined;
    await client.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password - Client
exports.resetPasswordClient = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const client = await Client.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!client) {
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

  client.password = req.body.password;
  client.resetPasswordToken = undefined;
  client.resetPasswordExpire = undefined;

  await client.save();

  sendToken(client, 200, res);
});