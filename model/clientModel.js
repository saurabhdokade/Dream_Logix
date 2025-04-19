const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto")
const clientSchema = new mongoose.Schema(
  {
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
      required: [false, "Please enter business name"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true
    },
    referral: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: [
        "SoleProprietor",
        "Company",
        "Partnership Firm",
        "Organization",
        "NGO"
      ],
      required: false
    },
    country: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    details: {
      type: String,
      default: ""
    },
    website: {
      type: String,
      default: ""
    },
    gst: {
      type: String,
      default: ""
      // On frontend, show only if country === 'India'
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Assuming you have a "Staff" model
      required: false // Default can be handled in controller or frontend
    },
    role: {
      type: String,
      enum: ["user", "Admin", "Client","Manager", "Guest"],
      default: "user",
    },
    teamMembers: {
      type: String,
      enum: ["Individual", "2-10 Members", "11-50 Members", "50+ Members"],
      required: false
    },
    address: {
      type: String,
      required: false
    },
    pincode: {
      type: String,
      required: false
    },
    cin: {
      type: String,
      default: ""
      // Frontend: show only if type === "Company"
    },
    industry: {
      type: String,
      required: false
      // Admin can manage dropdown values from a separate Industry model/table
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);


// Remove duplicate pre-save hook
clientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

clientSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Generate JWT Token
clientSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Reset Password Token
clientSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
  return resetToken;
};

clientSchema.methods.generateVerificationCode = function () {
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

module.exports = mongoose.model("Client", clientSchema);
