import multer from "multer";

const maxUploadSizeMb = Number(process.env.MEDIA_UPLOAD_LIMIT_MB || 200);

const storage = multer.memoryStorage();

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
