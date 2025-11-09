import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const deleteFromS3 = async (url: string): Promise<void> => {
  if (!url.includes(process.env.S3_WEBSITE_URL!)) return;

  const key = url.replace(process.env.S3_WEBSITE_URL + "/", "");

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error(`S3 delete error for ${key}:`, error);
  }
};

export const deleteMultipleFromS3 = async (urls: string[]): Promise<void> => {
  for (const url of urls) {
    await deleteFromS3(url);
  }
};
