// const Service = require("../model/servicesModel");
// const Request = require("../model/servicesRequestModel");
// const ErrorHandler = require("../utils/errorhandler");
// const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// // Add New Service/Product
// exports.addService = catchAsyncErrors(async (req, res, next) => {
//   const { name, description, price, category } = req.body;

//   const service = await Service.create({
//     name, description, price, category
//   });

//   res.status(201).json({ success: true, service });
// });

// // Get All Services/Products
// exports.getAllServices = catchAsyncErrors(async (req, res, next) => {
//   const services = await Service.find();
//   res.status(200).json({ success: true, services });
// });

// // Update Service/Product
// exports.updateService = catchAsyncErrors(async (req, res, next) => {
//   const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!service) {
//     return next(new ErrorHandler("Service/Product not found", 404));
//   }

//   res.status(200).json({ success: true, service });
// });

// // Delete Service/Product
// exports.deleteService = catchAsyncErrors(async (req, res, next) => {
//   const service = await Service.findByIdAndDelete(req.params.id);

//   if (!service) {
//     return next(new ErrorHandler("Service/Product not found", 404));
//   }

//   res.status(200).json({ success: true, message: "Service/Product deleted" });
// });


// // Add New Client Request
// exports.addRequest = catchAsyncErrors(async (req, res, next) => {
//   const { clientId, serviceId } = req.body;

//   const request = await Request.create({
//     clientId, serviceId
//   });

//   res.status(201).json({ success: true, request });
// });

// // Get All Client Requests
// exports.getAllRequests = catchAsyncErrors(async (req, res, next) => {
//   const requests = await Request.find().populate("clientId serviceId");
//   res.status(200).json({ success: true, requests });
// });
const ProductService = require("../model/servicesModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Add New Product/Service
exports.addProductService = catchAsyncErrors(async (req, res, next) => {
  const { name, type, pricingType, fixedPrice, featuredImage, videosOrImages, portfolioType } = req.body;

  const productService = await ProductService.create({
    name,
    type,
    productId,
    pricingType,
    fixedPrice,
    featuredImage,
    videosOrImages,
    portfolioType,
  });

  res.status(201).json({ success: true, productService });
});

exports.addPlanToProductService = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { planName, mrp, sellingPrice, shortDescription, description, tags } = req.body;

  // Log the productId to make sure it's being received correctly
  console.log('Received productId:', productId);

  // Find the product/service by productId
  const productService = await ProductService.findOne({ productId });

  // If no product found, handle the error
  if (!productService) {
    return next(new ErrorHandler("Product/Service not found", 404));
  }

  // Ensure that the pricingType of the product/service is "Create Plan" before adding plans
  if (productService.pricingType !== "Create Plan") {
    return next(new ErrorHandler("Plans can only be added to products with 'Create Plan' pricing type", 400));
  }

  // Create a new plan object
  const newPlan = {
    planName,
    mrp,
    sellingPrice,
    shortDescription,
    description,
    tags,
  };

  // Add the new plan to the plans array
  productService.plans.push(newPlan);

  // Save the updated product/service with the new plan
  await productService.save();

  res.status(201).json({
    success: true,
    message: "New plan added to the product/service",
    productService,
  });
});


// Get All Products/Services along with Plan Count
exports.getAllProductServices = catchAsyncErrors(async (req, res, next) => {
  const productServices = await ProductService.find();

  // Map to include the plan count for each product/service
  const productServicesWithPlanCount = productServices.map(service => {
    return {
      ...service.toObject(),
      planCount: service.plans.length,
    };
  });

  res.status(200).json({ success: true, productServices: productServicesWithPlanCount });
});

// Fetch a Single Product/Service with its Plans
exports.getProductServiceDetails = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const productService = await ProductService.findOne({ productId });

  if (!productService) {
    return next(new ErrorHandler("Product/Service not found", 404));
  }

  // Return the product/service along with its plans
  res.status(200).json({
    success: true,
    productService: {
      ...productService.toObject(),
      planCount: productService.plans.length, // Include plan count in the response
    },
  });
});
