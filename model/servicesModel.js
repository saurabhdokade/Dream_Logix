// const mongoose = require("mongoose");

// const serviceSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please enter service/product name"]
//   },
//   description: {
//     type: String,
//     required: [true, "Please enter a description"]
//   },
//   price: {
//     type: Number,
//     required: [true, "Please enter the price"]
//   },
//   category: {
//     type: String,
//     required: [true, "Please specify the category"]
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Service", serviceSchema);



const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Tags for the plan
  tags: [{
    type: String
  }],
}, { timestamps: true });

const productServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Product", "Service"],
    required: true,
  },
  productId: {
    type: String,
    required: true,
    unique: true, // Ensure each product has a unique ID
  },
  pricingType: {
    type: String,
    enum: ["Fix", "Create Plan"],
    required: true,
  },
  fixedPrice: {
    type: Number,
    required: function () { return this.pricingType === "Fix"; },
  },
  plans: [planSchema], // Array of plans if pricing type is "Create Plan"
  featuredImage: {
    type: String, // URL or path to the featured image
  },
  videosOrImages: [{
    type: String, // URLs or paths to uploaded images/videos
  }],
  portfolioType: {
    type: String,
    enum: ["Web Development", "Graphic Design", "Content Writing", "SEO", "Other"], // Example categories, you can modify these
  },
}, { timestamps: true });

module.exports = mongoose.model("ProductService", productServiceSchema);
