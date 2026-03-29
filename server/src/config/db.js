import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}
