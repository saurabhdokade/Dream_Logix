const express = require("express");
const router = express.Router();

const {
  // addProductService,
  // getAllProductServices,
  updateService,
  deleteService,
  addRequest,
  getAllRequests,
  addProductService,
  addPlanToProductService,
  getAllProductServices,
  getProductServiceDetails,
} = require("../controller/servicesController");


// Service/Product CRUD
// router.post("/services", addProductService);
// router.get("/services", getAllProductServices);
// router.put("/services/:id", updateService);
// router.delete("/services/:id", deleteService);

// // Client Requests
// router.post("/requests", addRequest);
// router.get("/requests", getAllRequests);

// Add new product/service
router.post("/productService", addProductService);

// Add new plan to an existing product/service (only if pricingType is "Create Plan")
router.post("/productService/:productId/plan", addPlanToProductService);

// Get all products/services along with the plan count
router.get("/productServices", getAllProductServices);

// Fetch details of a single product/service with plans
router.get("/productService/:productId", getProductServiceDetails);
module.exports = router;
