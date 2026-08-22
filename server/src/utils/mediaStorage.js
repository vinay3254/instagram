import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

const uploadDirectory = path.resolve("server", "uploads");

function buildFilename(originalname) {
  const extension = path.extname(originalname || "").toLowerCase() || ".jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}

export async function storeUploadedFile(file, req) {
  const filename = buildFilename(file.originalname);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, file.buffer, {
      access: "public",
      contentType: file.mimetype,
      addRandomSuffix: false,
    });

    return blob.url;
  }

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDirectory, filename), file.buffer);

  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}
