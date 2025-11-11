// src/utils/media/middlewares.ts
import { Request, Response, NextFunction } from "express";
import { uploadAndResizeToS3Single } from "./s3UploadUniversal";


export const uploadToS3SingleMiddlewareUniversal = (entity:
  "products" | "categories" | "brands" | "sliders") =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();
    try {
      const urls = await uploadAndResizeToS3Single(req.file, entity);
      req.body.uploadedUrl = urls;
      next();
    } catch (e) { next(e); }
  };

export const uploadToS3MultipleUniversal = (entity:
  "products" | "categories" | "brands" | "sliders") =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.files) return next();
    const files = req.files as { [field: string]: Express.Multer.File[] };
    const uploaded: Record<string, any[]> = {};
    try {
      for (const field in files) {
        uploaded[field] = [];
        for (const f of files[field]) {
          uploaded[field].push(await uploadAndResizeToS3Single(f, entity));
        }
      }
      req.body.uploadedUrls = uploaded;
      next();
    } catch (e) { next(e); }
  };
