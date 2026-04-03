import multer from "multer";
import fs from "fs";
import path from "path";

// 🔥 dynamic folder create function
const createFolder = (folderName) => {
    const uploadPath = path.join(process.cwd(), "uploads", folderName);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
};

// 🔥 storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.uploadFolder || "common"; // dynamic folder
        const uploadPath = createFolder(folder);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// 🔥 file filter
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error("Only images allowed"), false);
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});