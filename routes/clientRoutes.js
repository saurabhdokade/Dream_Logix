const express = require("express");
const router = express.Router();
const {
  createClient,
  clientLogin,
  getAllClients,
  updateClient,
  deleteClient,
  forgotPasswordClient,
  resetPasswordClient,
  logoutClient,
  suspendClient,
} = require("../controller/clientController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.post("/clients/add", createClient);
router.post("/clients/login", clientLogin)
router.get("/clients", isAuthenticatedUser, getAllClients);
router.put("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);

router.post("/client/password/forgot", forgotPasswordClient);
router.put("/client/password/reset/:token", resetPasswordClient);
router.get("/client/logout", logoutClient);

router.put("/client/suspend/:userId", suspendClient);

module.exports = router;
