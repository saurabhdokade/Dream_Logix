const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter lead name"],
    },
    businessName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Please enter phone number"],
    },
    referrel: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Sole Proprietor", "Company", "Partnership Firm", "Organization", "NGO"],
      required: [true, "Please select the type"],
    },
    country: {
      type: String,
      required: [true, "Please enter country"],
    },
    state: {
      type: String,
      required: [true, "Please enter state"],
    },
    gst: {
      type: String,
      default: "",
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming staff are stored in User model
      default: null,
    },
    teamMembers: {
      type: String,
      enum: ["Individual", "2 - 10 Members", "11 - 50 Members", "50+ Members"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    cin: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    productsAndServices: [
      {
        type: String,
      },
    ],
    ticketSize: {
      type: String,
      required: false,
    },
    details: {
      type: String,
    },
    website: {
      type: String,
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Converted", "Closed"],
      default: "New",
    },
    source: {
      type: String,
      default: "Manual Entry",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
