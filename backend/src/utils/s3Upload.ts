import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response, NextFunction } from "express";
import fs from "fs";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3Single = async (
  file: Express.Multer.File
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${Date.now()}-${file.filename}`,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    const publicUrl = `${process.env.S3_WEBSITE_URL}/${params.Key}`;

    fs.unlinkSync(file.path);
    return publicUrl;

  } catch (error) {
    throw new Error(`S3 upload error: ${(error as Error).message}`);
  }
};


export const uploadToS3Multiple = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.files) return next();

  const files = req.files as { [key: string]: Express.Multer.File[] };
  const uploadedUrls: { [key: string]: string[] } = {};

  try {
    for (const field in files) {
      uploadedUrls[field] = [];
      for (const file of files[field]) {
        const url = await uploadToS3Single(file);
        uploadedUrls[field].push(url);
      }
    }
    req.body.uploadedUrls = uploadedUrls;
    next();
  } catch (error) {
    next(error);
  }
};

export const uploadToS3SingleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.file) return next();

  try {
    const url = await uploadToS3Single(req.file);
    req.body.uploadedUrl = url;
    next();
  } catch (error) {
    next(error);
  }
};
