const express = require("express");
const router = express.Router();
const {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead
} = require("../controller/leadController");

router.post("/leads", createLead);
router.get("/leads", getAllLeads);
router.put("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);

module.exports = router;
