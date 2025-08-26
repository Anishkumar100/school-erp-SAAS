// db.js
const mongoose = require("mongoose");

// Get the MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no promise of a connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // This is recommended for serverless
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, reset the promise and throw the error
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectToDatabase;

