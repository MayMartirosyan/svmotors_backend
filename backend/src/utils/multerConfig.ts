import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { convertToWebp, convertToWebpMultiple } from "../middlewares/convertToWebp";
import { uploadToS3Multiple, uploadToS3SingleMiddleware } from "./s3Upload";

const uploadDir = path.join(__dirname, "../../Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
  const allowedAudioTypes = /mp3|mp4|m4a/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    allowedImageTypes.test(ext) ||
    allowedImageTypes.test(mime.split("/")[1])
  ) {
    cb(null, true);
  } else if (
    allowedAudioTypes.test(ext) ||
    allowedAudioTypes.test(mime.split("/")[1])
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only images (jpeg, jpg, png, gif) and audio (mp3, mp4, m4a) are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadAndConvertSingle = (fieldName: string) => [
  upload.single(fieldName),
  convertToWebp,
];

export const uploadAndConvertMultiple = (fields: string[]) => [
  upload.fields(
    fields.map((field) => ({
      name: field,
      maxCount:
        field.includes("introBgImage") || field.includes("dressCodeImage")
          ? 10
          : 1,
    }))
  ),
  convertToWebpMultiple,
];

export const uploadAndConvertSingleWithS3 = (fieldName: string) => [
  upload.single(fieldName),
  convertToWebp,
  uploadToS3SingleMiddleware,
];


export const uploadAndConvertMultipleWithS3 = (fields: string[]) => [
  upload.fields(
    fields.map((field) => ({
      name: field,
      maxCount:
        field.includes("introBgImage") || field.includes("dressCodeImage")
          ? 10
          : 1,
    }))
  ),
  convertToWebpMultiple,
  uploadToS3Multiple,
];