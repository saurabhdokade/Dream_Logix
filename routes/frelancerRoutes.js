const express = require("express");
const router = express.Router();

const {
  createfrelancer,
  freelancerLogin,
  getAllFreelancers,
  updateFreelancer,
  deleteFreelancer, submitPortfolio,
  updatePortfolioStatus,forgotPasswordFreelancer,
  resetPasswordFreelancer,logoutfrelancer
} = require("../controller/frelancerController");

// Freelancer CRUD
router.post("/frelancers/add", createfrelancer);
router.post("/frelancers/login", freelancerLogin)
router.get("/freelancers", getAllFreelancers);
router.put("/freelancers/:id", updateFreelancer);
router.delete("/freelancers/:id", deleteFreelancer);

router.post("/frelancer/password/forgot", forgotPasswordFreelancer);
router.put("/frelancer/password/reset/:token", resetPasswordFreelancer);
router.get("/frelancer/logout", logoutfrelancer);

// Portfolio
router.post("/portfolio/:freelancerId", submitPortfolio);
router.put("/portfolio/:id/status", updatePortfolioStatus);

module.exports = router;
