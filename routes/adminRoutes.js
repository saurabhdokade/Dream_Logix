// adminRoutes.js
const express = require("express");//
const router = express.Router();
const {adminLogin, adminRegister,logout,forgotPassword, resetPassword} = require("../controller/adminController");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/auth");

// Admin Login route
router.route("/admin/register").post(adminRegister)
router.route("/admin/login").post(adminLogin);
router.route("/logout").get(logout)
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
module.exports = router;
