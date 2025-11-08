import fs from "fs";
import path from "path";
import { deleteFromS3 } from "./s3Delete";

export const getImagePath = (req: any): string | undefined => {
  const storageType = process.env.FILE_STORAGE || "local";

  if (storageType === "s3") {
    return req.body.uploadedUrl; 
  } else {

    return req.file ? `/Uploads/${req.file.filename}` : undefined;
  }
};

export const deleteFile = async (imagePath: string): Promise<void> => {
  if (!imagePath) return;

  const storageType = process.env.FILE_STORAGE || "local";

  if (storageType === "s3") {
    deleteFromS3(imagePath);
  } else {
    const fileName = path.basename(imagePath); 
    const fullPath = path.join(__dirname, "../../Uploads", fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

export const getExistingEntity = async <T>(
  service: any,
  methodName: string,
  id: number,
  notFoundMsg: string = "Not found"
): Promise<T> => {
  const entity = await service[methodName](id);
  if (!entity) {
    throw new Error(notFoundMsg);
  }
  return entity;
};
