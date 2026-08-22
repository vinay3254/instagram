import app from "../server/src/app.js";
import { connectDatabase } from "../server/src/config/db.js";

export default async function handler(req, res) {
  await connectDatabase(process.env.MONGO_URI);
  return app(req, res);
}
