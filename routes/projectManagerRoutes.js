const express = require("express");
const router = express.Router();
const {
  createProjectManager,
  getAllProjectManagers,
  updateProjectManager,
  deleteProjectManager
} = require("../controller/projectManagerController");

router.post("/api/project-managers", createProjectManager);
router.get("/api/project-managers", getAllProjectManagers);
router.put("/api/project-managers/:id", updateProjectManager);
router.delete("/api/project-managers/:id", deleteProjectManager);

module.exports = router;
