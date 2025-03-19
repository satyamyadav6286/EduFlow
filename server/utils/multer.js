import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory with absolute path using path.resolve for cross-platform compatibility
const uploadsDir = path.resolve(__dirname, "../uploads");
console.log("Uploads directory:", uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  console.log("Creating uploads directory:", uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log("Saving file:", filename, "to", uploadsDir);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    console.log("File accepted:", file.originalname, file.mimetype);
    cb(null, true);
  } else {
    console.log("File rejected:", file.originalname, file.mimetype);
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file size limit
  }
});

export default upload;
