const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const allowed = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "tags",
    ];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (!payload.title) {
      return res.status(400).json({error: "Title is required"});
    }
    payload.userId = req.user.id;
    const task = await Task.create(payload);
    res.json(task);
  } catch (err) {
    res.status(500).json({error: "Server error"});
  }
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({userId: req.user.id});
  res.json(tasks);
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({error: "Task not found"});
    }
    const allowed = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "tags",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    }
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({error: "Server error"});
  }
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.userId.toString() !== req.user.id.toString()) {
    return res.status(404).json({error: "Task not found"});
  }
  await Task.findByIdAndDelete(req.params.id);
  res.json({message: "Task deleted"});
};
