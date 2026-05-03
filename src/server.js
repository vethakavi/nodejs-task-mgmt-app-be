require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "https://task-mgmt-app-fe.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.listen(process.env.PORT || 5001, () => console.log("Server running"));
