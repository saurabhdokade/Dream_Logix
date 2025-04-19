const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ProjectManager = require("../model/projectManagerModel");
const Task = require("../model/taskModel");
const ErrorHandler = require("../utils/errorhandler");

// Create Project Manager
exports.createProjectManager = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, assignedTasks } = req.body;

  // Create a new Project Manager
  const projectManager = await ProjectManager.create({
    name,
    email,
    phone,
    assignedTasks // Array of Task ObjectIds
  });

  res.status(201).json({
    success: true,
    message: "Project Manager created successfully.",
    projectManager
  });
});

// Get All Project Managers
exports.getAllProjectManagers = catchAsyncErrors(async (req, res, next) => {
  const projectManagers = await ProjectManager.find()
    .populate("assignedTasks", "taskName description status") // Populate task details
    .exec();

  res.status(200).json({
    success: true,
    projectManagers
  });
});

// Update Project Manager
exports.updateProjectManager = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, assignedTasks } = req.body;

  const projectManager = await ProjectManager.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, assignedTasks },
    { new: true, runValidators: true }
  );

  if (!projectManager) {
    return next(new ErrorHandler("Project Manager not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Project Manager updated",
    projectManager
  });
});

// Delete Project Manager
exports.deleteProjectManager = catchAsyncErrors(async (req, res, next) => {
  const projectManager = await ProjectManager.findByIdAndDelete(req.params.id);

  if (!projectManager) {
    return next(new ErrorHandler("Project Manager not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Project Manager deleted"
  });
});
