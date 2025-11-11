// src/utils/media/s3UploadUniversal.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const SIZES = {
  original: 2000,   // «потолок» по ширине, без апскейла
  large: 1200,
  medium: 800,
  small: 420,
  thumb: 200,
} as const;

type SizeKey = keyof typeof SIZES;

function keyFor(entity: string, size: SizeKey, baseName: string) {
  return `images/${entity}/${size}/${baseName}.webp`;
}

async function resizeToWebp(input: Buffer, width: number) {
  return sharp(input)
    .rotate()                               
    .resize({ width, withoutEnlargement: true, fit: "inside" })
    .sharpen({ sigma: 0.8 })                   
    .webp({ quality: 88, effort: 4, smartSubsample: true })
    .toBuffer();
}

export async function uploadAndResizeToS3Single(
  file: Express.Multer.File,
  entity: "products" | "categories" | "brands" | "sliders"
): Promise<Record<SizeKey, string>> {
  const buf = fs.readFileSync(file.path);
  const baseName = `${Date.now()}-${path.basename(file.filename, path.extname(file.filename))}`;

  const out: Record<SizeKey, string> = {} as any;


  await Promise.all(
    (Object.keys(SIZES) as SizeKey[]).map(async (sizeKey) => {
      const width = SIZES[sizeKey];
      const body = await resizeToWebp(buf, width);
      const Key = keyFor(entity, sizeKey, baseName);

      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key,
        Body: body,
        ContentType: "image/webp",
        ACL: "public-read",
      }));

      out[sizeKey] = `${process.env.S3_WEBSITE_URL}/${Key}`;
    })
  );

  fs.unlinkSync(file.path);
  return out;
}

export async function deleteAllVariantsFromS3(publicUrlAnySize: string) {

  const website = (process.env.S3_WEBSITE_URL || "").replace(/\/+$/, "");
  if (!publicUrlAnySize.startsWith(website)) return;

  const key = publicUrlAnySize.replace(`${website}/`, ""); 
  const parts = key.split("/");
  if (parts.length < 4) return;

  const [images, entity, _size, ...rest] = parts;
  const base = rest.join("/");

  await Promise.all(
    (Object.keys(SIZES) as SizeKey[]).map(async (sizeKey) => {
      const k = `images/${entity}/${sizeKey}/${base}`;
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: k }));
    })
  );
}
