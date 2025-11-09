import * as fs from "fs";
import * as path from "path";
import { deleteMultipleFromS3 } from "./s3Delete";

export function toCamelCase<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    if (obj instanceof Date) {
      return new Date(obj).toISOString() as any as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as any as T;
  }

  return Object.keys(obj).reduce((result: any, key) => {
    const camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
    const value = obj[key as keyof T];
    result[camelKey] =
      value instanceof Date
        ? new Date(value).toISOString()
        : toCamelCase(value);
    return result;
  }, {} as T);
}

export function toSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    if (obj instanceof Date) {
      return new Date(obj).toISOString() as any as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as any as T;
  }

  return Object.keys(obj).reduce((result: any, key) => {
    const snakeKey = key
      .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
      .replace(/^_/, "");
    const value = obj[key as keyof T];
    result[snakeKey as keyof T] =
      value instanceof Date
        ? new Date(value).toISOString()
        : toSnakeCase(value);
    return result;
  }, {} as T);
}

function getRelativePath(img: string): string {
  return img.startsWith(process.env.S3_WEBSITE_URL as string)
    ? img.replace(process.env.S3_WEBSITE_URL + "/", "")
    : img.startsWith("/Uploads/")
    ? img.replace("/Uploads/", "")
    : img;
}

export async function handleMultiImageUpdate(
  previousImages: string[],
  currentImages: string | string[],
  newFiles: any,
  uploadDir?: string
): Promise<string[]> {
  // Если currentImages - строка (для single-полей), преобразуем в массив
  const currentImagesArray = Array.isArray(currentImages)
    ? currentImages
    : currentImages
    ? [currentImages]
    : [];

  const currentRelativePaths = currentImagesArray.map(getRelativePath);

  const previousRelativePaths = previousImages.map(getRelativePath);

  const imagesToDelete = previousRelativePaths
    .filter((prevPath) => !currentRelativePaths.includes(prevPath))
    .map((path) => {
      if (path.startsWith(`https://${process.env.S3_BUCKET_NAME}`)) {
        return `https://${
          process.env.S3_BUCKET_NAME
        }.${process.env.S3_ENDPOINT!.replace("https://", "")}/${path}`;
      }
      return path.startsWith("/Uploads/") ? `/Uploads/${path}` : path;
    });

  if (uploadDir) {
    imagesToDelete.forEach((img) => {
      const filePath = path.join(
        uploadDir,
        getRelativePath(img).replace("/Uploads/", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } else {
    await deleteMultipleFromS3(imagesToDelete);
  }

  const newImagePaths: string[] = [];
  if (newFiles) {
    newImagePaths.push(
      ...(Array.isArray(newFiles) && typeof newFiles[0] === "string"
        ? newFiles
        : newFiles.map((file: any) => `/Uploads/${file.filename}`))
    );
  }

  const updatedImages = [...currentImagesArray, ...newImagePaths];

  return updatedImages.filter((img) => img);
}
