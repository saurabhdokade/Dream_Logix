const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../model/userModel");
const Category = require("../model/categoriesModel");
// const Role = require("../models/role.model");
const ErrorHander = require("../utils/errorhandler");

// Create User
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, confirmPassword ,role, category } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword, 
    phone,
    role,
    category,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully.",
    newUser,
  });
});

exports.userLogin = catchAsyncErrors(async (req, res, next) => {
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

// Get All Users
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().populate("category", "name").exec();
  res.status(200).json({ success: true, users });
});

// Update User
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, role, category } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, role, category },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user,
  });
});

// Delete User
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});



// Create Category
exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;
  
    const category = await Category.create({
      name,
      description,
    });
  
    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  });
  
  // Get All Categories
  exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      categories,
    });
  });
  
  // Update Category
  exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;
  
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
  
    if (!category) {
      return next(new ErrorHander("Category not found", 404));
    }
  
    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  });

  // Get All Roles
// Get All Roles (Static Enum Values)
exports.getAllRoles = catchAsyncErrors(async (req, res, next) => {
    const roles = ["user", "Admin", "Moderator", "Manager", "Guest"];
  
    res.status(200).json({
      success: true,
      roles,  // Send the list of roles directly from the enum
    });
  });