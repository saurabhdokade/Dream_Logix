const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer",
    required: true,
  },
  projectTitle: {
    type: String,
    required: [true, "Please enter project title"],
  },
  description: {
    type: String,
    required: [true, "Please enter project description"],
  },
  link: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "", // image file path or URL
  },
  video: {
    type: String,
    default: "", // video file path or link
  },
  type: {
    type: String,
    enum: ["Link", "Image", "Video"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
}, {
  timestamps: true,
});


module.exports = mongoose.model("Portfolio", portfolioSchema);
