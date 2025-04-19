const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  createCategory,
  getAllCategories,
  updateCategory,
  getAllRoles
} = require("../controller/userController");
// User routes
router.post("/api/users", createUser);
router.get("/api/users", getAllUsers);
router.put("/api/users/:id", updateUser);
router.delete("/api/users/:id", deleteUser);

// Category routes
router.post("/api/categories", createCategory);
router.get("/api/categories", getAllCategories);
router.put("/api/categories/:id", updateCategory);

//role
router.get("/api/roles", getAllRoles);

module.exports = router;
