// Imports the Express framework to build a RESTful API
const express = require("express");
// Enables CORS (Cross-Origin Resource Sharing), allowing frontend apps (like React) to make API requests to this backend.
const cors = require("cors");
// Used to hash passwords securely before saving them to the database.
// Also used to compare hashed passwords during login.
const bcrypt = require("bcryptjs");
// Used to create and verify JWT tokens for authentication.
const jwt = require("jsonwebtoken");
// requiring the models
const User = require("./database/user");
const Task = require("./database/task");
const TaskStatus = require("./database/taskStatus");
// imports your JWT authentication middleware
const authMiddleware = require("./middleware/auth");
const taskStatus = require("./database/taskStatus");

// Initializes the Express app instance.
const app = express();
// Allows the backend to accept requests from a different origin
app.use(cors());
// Parses incoming requests with Content-Type: application/json.
// So that req.body works for JSON POST requests
app.use(express.json());

// ################################## User Management <<<<<
// API -> Register new user
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10); // this should be done at client side
  const user = new User({
    name,
    email,
    password: hashedPassword,
    joiningdate: Date.now(),
    isActive: true,
  });
  console.log("registered user: ");
  console.log(user);
  await user.save();

  res.json({ message: "User registered successfully" });
});
// API -> Login User
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, "SECRET123", {
    expiresIn: "1h",
  });
  res.json({ token });
});
// ################################## User Management >>>>>

// ################################## User Secret key management <<<<<
// API -> Store the Encrpted Secret key of the user
app.post("/api/MasterSecretKey", async (req, res) => {
  try {
    const { email, encryptedSecretKey } = req.body;

    const result = await User.updateOne(
      { email },
      { $set: { encryptedSecretKey } }
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or key unchanged" });
    }

    res.json({ message: "Secret key updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API -> Get the Enccrypted secret key for the user
app.get("/api/MasterSecretKey", async (req, res) => {
  const email = req.query.email;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ encryptedSecretKey: user.encryptedSecretKey });
});
// ################################## User Secret key management >>>>>

// ################################## Routes for Tasks <<<<<
// API -> Get All Tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const tasks = await Task.find({ createdBy: userId }).populate("taskStatus");
  res.json(tasks);
});

// API -> Get Overdue Tasks
app.get("/api/overdueTasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const pendingStatus = await TaskStatus.findOne({ name: "Created" });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const tasks = await Task.find({
    createdBy: userId,
    taskStatus: pendingStatus._id,
     createdDate: { $lte: startOfDay },
  }).populate("taskStatus");
  res.json(tasks);
});
// API -> Get Pending Tasks
app.get("/api/pendingTasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const pendingStatus = await TaskStatus.findOne({ name: "Created" });
  const tasks = await Task.find({
    createdBy: userId,
    taskStatus: pendingStatus._id,
    createdDate: { $gte: startOfDay, $lte: endOfDay },
  }).populate("taskStatus");;
  res.json(tasks);
});
// API -> Get Completed Tasks
app.get("/api/completedTasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const completedStatus = await TaskStatus.findOne({ name: "Completed" });
  const tasks = await Task.find({
    createdBy: userId,
    taskStatus: completedStatus._id,
    createdDate: { $gte: startOfDay, $lte: endOfDay },
  }).populate("taskStatus");
  res.json(tasks);
});

// API -> Add new Task
app.post("/api/addTask", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const createdStatus = await TaskStatus.findOne({ name: "Created" });
  const task = new Task({
    taskName: req.body.taskName,
    createdDate: Date.now(),
    createdBy: userId,
    taskStatus: createdStatus,
    fromDate: req.body.fromDate ? new Date(req.body.fromDate) : null,
    toDate: req.body.toDate ? new Date(req.body.toDate) : null,
    isReOccurring: req.body.isReOccurring || false,
  });
  await task.save();
  res.json(task);
});

// API -> Delete Task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
// API -> Mark Task as Started
// app.post("/api/tasks/:id/start", authMiddleware, async (req, res) => {
//   const inProgressStatus = await TaskStatus.findOne({ name: "In Progress" });
//   await Task.updateOne(
//     { _id: req.params.id },
//     { $set: { taskStatus: inProgressStatus._id } }
//   );
//   res.json({ success: true });
// });

// API -> Mark Task as Completed
app.post("/api/tasks/:id/complete", authMiddleware, async (req, res) => {
  const completedStatus = await TaskStatus.findOne({ name: "Completed" });
  await Task.updateOne(
    { _id: req.params.id },
    { $set: { taskStatus: completedStatus._id } }
  );
  res.json({ success: true });
});

// ################################## Routes for Tasks >>>>>

// ################################## starting the server <<<<<
const PORT = 3001;
// starts your Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// ################################## starting the server >>>>>
