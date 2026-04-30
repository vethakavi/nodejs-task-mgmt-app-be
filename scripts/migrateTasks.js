const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

const run = async () => {
  await connectDB();
  try {
    const cursor = Task.find({ status: { $exists: false } }).cursor();
    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      let status = 'todo';
      if (doc.completed) status = 'completed';
      else if (doc.inProgress) status = 'inProgress';
      else if (doc.todo) status = 'todo';
      doc.status = status;
      if (!doc.priority) doc.priority = 'medium';
      // remove legacy boolean fields if present
      doc.completed = undefined;
      doc.inProgress = undefined;
      doc.todo = undefined;
      await doc.save();
      count++;
    }
    console.log(`Migrated ${count} tasks`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
