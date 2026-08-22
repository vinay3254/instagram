import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);
  return mongoose.connect(uri);
}
