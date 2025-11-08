import sharp from "sharp";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

export const convertToWebp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".webp") {
    return next();
  }

  const webpPath = filePath.replace(ext, ".webp");

  try {
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    fs.unlinkSync(filePath);

    req.file.filename = path.basename(webpPath);
    req.file.path = webpPath;

    next();
  } catch (error) {
    console.error("Error converting to WebP:", error);
    next(error as Error);
  }
};

export const convertToWebpMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.files) return next();

  const files = req.files as { [key: string]: Express.Multer.File[] };
  const conversionPromises = [];

  for (const field in files) {
    for (const file of files[field]) {
      const filePath = file.path;
      const ext = path.extname(filePath).toLowerCase();

      if (ext === ".webp" || !/jpeg|jpg|png|gif/.test(ext)) {
        continue; 
      }

      const webpPath = filePath.replace(ext, ".webp");
      conversionPromises.push(
        sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath)
          .then(() => {
            fs.unlinkSync(filePath);
            file.filename = path.basename(webpPath);
            file.path = webpPath;
          })
          .catch((error) => {
            console.error(`Error converting ${filePath} to WebP:`, error);
            throw error;
          })
      );
    }
  }

  try {
    await Promise.all(conversionPromises);
    next();
  } catch (error) {
    next(error as Error);
  }
};