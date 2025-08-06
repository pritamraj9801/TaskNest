// This db.js file sets up and exports a Mongoose connection to your local MongoDB database called tasknest
// Imports the Mongoose library, which provides an easy-to-use API for working with MongoDB in Node.js.
const mongoose = require('mongoose');
// MongoDB connection string
const mongodbConnectionUrl  ="mongodb://localhost:27017/tasknest";

// connect to database using mongoose
mongoose.connect(mongodbConnectionUrl, {
  useNewUrlParser: true, // Uses the new URL parser for connection strings
  useUnifiedTopology: true, // Enables the new MongoDB driver's unified topology layer (improves connection handling)
});

// Registers a listener for the "connected" event, which logs a success message when the database connection is established.
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to tasknest');
});

// Registers a listener for the `"error"` event, so if the connection fails or breaks, you'll see the error in your console.
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// Exports the configured Mongoose instance so you can import and use it in your models and routes:
module.exports = mongoose;
