const mongoose = require("mongoose");

const projectManagerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of the project manager"]
  },
  email: {
    type: String,
    required: [true, "Please enter the email address"],
    unique: true
  },
  phone: {
    type: String,
    required: [true, "Please enter the phone number"]
  },
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  role: {
    type: String,
    default: "Project Manager"
  }
}, { timestamps: true });

module.exports = mongoose.model("ProjectManager", projectManagerSchema);
