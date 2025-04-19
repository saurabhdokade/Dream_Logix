const express = require("express");
const router = express.Router();
const {
  createPartner,
  getAllPartners,
  partenerLogin,
  updatePartner,
  deletePartner,
  forgotPasswordPartner,
  resetPasswordPartner,
  logoutPartner,
} = require("../controller/partenerController");

router.post("/add", createPartner);
router.post("/login",partenerLogin)
router.get("/partners", getAllPartners);
router.put("/partners/:id", updatePartner);
router.delete("/partners/:id", deletePartner);

// Forgot Password - Partner
router.post("/partner/password/forgot", forgotPasswordPartner);

// Reset Password - Partner
router.put("/partner/password/reset/:token", resetPasswordPartner);

// Logout - Partner
router.get("/partner/logout", logoutPartner);
module.exports = router;
