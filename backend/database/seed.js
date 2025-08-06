// Connects to your MongoDB using the shared db.js connection file
const mongoose = require('./db');
// Imports the Mongoose model for the TaskStatus collection.
const TaskStatus = require('./taskStatus');

async function seedStatuses() {
  const statuses = ['Created', 'In Progress', 'Completed'];
  for (let name of statuses) {
    await TaskStatus.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  console.log('Statuses seeded.');
  process.exit();
}

seedStatuses();

// to seed the data you will have to run 👉 node seed.js 👈, from the terminal