import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve("server", "uploads");
const maxUploadSizeMb = Number(process.env.MEDIA_UPLOAD_LIMIT_MB || 200);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

function fileFilter(_req, file, callback) {
  if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
    callback(new Error("Only image and video uploads are supported."));
    return;
  }

  callback(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadSizeMb * 1024 * 1024,
  },
});
