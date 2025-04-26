const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const partnerSchema = new mongoose.Schema({
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
  country: {
    type: String,
    required: false,
    enum: ['India', 'Germany', 'Australia'], // Enum for countries
  },
  state: {
    type: String,
    required: false,
    validate: {
      validator: function(value) {
        const countryStates = {
          India: [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
            "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
            "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
          ],
          Germany: [
            "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", 
            "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", 
            "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", 
            "Schleswig-Holstein", "Thuringia"
          ],
          Australia: [
            "New South Wales", "Queensland", "South Australia", "Tasmania", 
            "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"
          ]
        };

        // Check if the state is valid for the given country
        return countryStates[this.country] && countryStates[this.country].includes(value);
      },
      message: 'Invalid state for the selected country'
    }
  },
  type: {
    type: String,
    enum: ["SolePropritor", "Company", "Partnership firm", "Organization", "NGO"],
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
  program: {
    type: String,
    enum: [
      "DLX On-Branch Partner (Franchise Model)",
      "DLX Off-Branch Partner (Reseller Model)",
      "Affiliate Partner"
    ],
    required: false,
  },
  productsAndServices: {
    type: [String],
    required: false
  },
  details: {
    type: String,
  },
  website: {
    type: String,
  },
  gst: {
    type: String,
    default: ""
  },
  pancard: {
    type: String,
    default: "" // Path to uploaded PAN card
  },
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming User model is used for admin/staff
    default: null
  },
  teamMembers: {
    type: String,
    enum: ["Indivisual", "2 - 10 Members", "11 - 50 Members", "50+ Members"],
    required: false
  },
  role: {
    type: String,
    enum: ["user", "Admin", "partner","Manager", "Guest"],
    default: "user",
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
  },
  industry: {
    type: String,
    required: false
  },
  tags: {
    type: [String],
    default: []
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
}, {
  timestamps: true
});
partnerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});



// Compare password method for login
partnerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
partnerSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Reset Password Token
partnerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
  return resetToken;
};

partnerSchema.methods.generateVerificationCode = function () {
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

module.exports = mongoose.model("Partner", partnerSchema);
