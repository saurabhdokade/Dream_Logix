const Lead = require("../model/leadModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create Lead
// Create Lead
exports.createLead = catchAsyncErrors(async (req, res, next) => {
    const {
      name,
      businessName,
      phone,
      referrel,
      email,
      type,
      country,
      state,
      gst,
      accountManager,
      teamMembers,
      address,
      pincode,
      cin,
      industry,
      tags,
      productsAndServices,
      ticketSize,
      details,
      website,
      status,
      source,
      notes
    } = req.body;
  
    if (!name || !phone || !type || !country || !state || !teamMembers || !address || !pincode || !industry) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }
  
    // Conditional validation
    if (country === "India" && !gst) {
      return next(new ErrorHandler("GST is required for Indian leads", 400));
    }
  
    if (type === "Company" && !cin) {
      return next(new ErrorHandler("CIN is required for company type leads", 400));
    }
  
    const lead = await Lead.create({
      name,
      businessName,
      phone,
      referrel,
      email,
      type,
      country,
      state,
      gst,
      accountManager,
      teamMembers,
      address,
      pincode,
      cin,
      industry,
      tags,
      productsAndServices,
      ticketSize,
      details,
      website,
      status,
      source,
      notes
    });
  
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead
    });
  });
  

// Get All Leads
exports.getAllLeads = catchAsyncErrors(async (req, res, next) => {
  const leads = await Lead.find();
  res.status(200).json({ success: true, leads });
});

// Update Lead
exports.updateLead = catchAsyncErrors(async (req, res, next) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!lead) {
    return next(new ErrorHandler("Lead not found", 404));
  }

  res.status(200).json({ success: true, message: "Lead updated", lead });
});

// Delete Lead
exports.deleteLead = catchAsyncErrors(async (req, res, next) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);

  if (!lead) {
    return next(new ErrorHandler("Lead not found", 404));
  }

  res.status(200).json({ success: true, message: "Lead deleted" });
});
