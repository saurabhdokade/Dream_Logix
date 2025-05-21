const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cors = require('cors');

// Middlewares
const errorMiddleware = require("./middlewares/error");
const adminRoutes = require("./routes/adminRoutes");
const partener = require("./routes/partenerRoutes")
const client = require("./routes/clientRoutes")
const lead = require("./routes/leadRoutes");
const frelancer = require("./routes/frelancerRoutes");
const services = require("./routes/servicesRoutes");
const projectManager = require("./routes/projectManagerRoutes");
const settings = require("./routes/userRoutes")
// Initialize Express App
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000","https://dashlite-nu.vercel.app"],
  credentials: true
}));


// Routes
app.use("/api/v1/",adminRoutes);
app.use("/api/v1/partener",partener)
app.use("/api/v1/",client);
app.use("/api/v1/lead",lead);
app.use("/api/v1/frelancer",frelancer);
app.use("/api/v1/services",services);
app.use("/api/v1/projectManager",projectManager);
app.use("/api/v1/settings",settings)

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: (req) => req.ip,
});
app.use(limiter);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
