import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./client";

export async function generateDownloadPresignedUrl(
  key: string,
  expiresInSeconds = 900,
  downloadFilename?: string
): Promise<string | null> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    console.warn("Cloudflare R2 client or bucket is not configured.");
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: downloadFilename
        ? `attachment; filename="${downloadFilename}"`
        : undefined,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    return null;
  }
}

export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 600
): Promise<{ uploadUrl: string; key: string } | null> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    console.warn("Cloudflare R2 client or bucket is not configured.");
    return null;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return { uploadUrl, key };
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    return null;
  }
}
