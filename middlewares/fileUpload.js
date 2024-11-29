import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = `uploads/${file.fieldname}`;
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, req?.authUser?.uId + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
