import { deleteAllVariantsFromS3 } from "./media/s3UploadUniversal";

// export const getImagePath = (req: any): any => {
//   const storageType = process.env.FILE_STORAGE || "local";
//   if (storageType === "s3") {
//     return req.body.uploadedUrl; 
//   }
//   return req.file ? `/Uploads/${req.file.filename}` : undefined;
// };

export const getImagePath = (req: any) => {
  return req.body.uploadedUrl || null;
};


export const deleteFile = async (imageObj: any) => {
  if (!imageObj) return;
  const urls = Object.values(imageObj).filter(Boolean);
  for (const url of urls) {
    await deleteAllVariantsFromS3(url as string);
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
