const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const freelancerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"]
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"]
  },
  businessName: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
  type: {
    type: String,
    enum: ["SolePropritor", "Company", "Small team"],
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  details: {
    type: String,
  },
  website: {
    type: String,
  },
  gst: {
    type: String,
    default: "",
  },
  pancard: {
    type: String, // store file path or URL
    default: "",
  },
  adharcard: {
    type: String, // only if SolePropritor
    default: "",
  },
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming staff/admin stored in User
    default: null,
  },
  teamMembers: {
    type: String,
    enum: ["Indivisual", "2 - 10 Members", "11 - 50 Members", "50+ Members"],
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  pincode: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "Admin", "Freelancer","Manager", "Guest"],
    default: "user",
  },
  cin: {
    type: String,
    default: "",
  },
  industry: {
    type: String,
    required: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  changePasswordToken: String,
  changePasswordExpire: Date,
}, {
  timestamps: true,
});
// Remove duplicate pre-save hook
freelancerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});



// Compare password method for login
freelancerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
freelancerSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Reset Password Token
freelancerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
  return resetToken;
};

freelancerSchema.methods.generateVerificationCode = function () {
  const generateRandomFiveDigitNumber = () => {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return parseInt(firstDigit + remainingDigits);
  };

  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

  return verificationCode;
};

module.exports = mongoose.model("Freelancer", freelancerSchema);
