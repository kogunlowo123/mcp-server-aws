import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

export const s3GetObjectSchema = z.object({
  bucket: z.string().describe("S3 bucket name"),
  key: z.string().describe("Object key (path) in the bucket"),
});

export type S3GetObjectInput = z.infer<typeof s3GetObjectSchema>;

export async function s3GetObject(input: S3GetObjectInput): Promise<string> {
  const client = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

  const command = new GetObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
  });

  const response = await client.send(command);
  const body = await response.Body?.transformToString();

  return JSON.stringify(
    {
      bucket: input.bucket,
      key: input.key,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified?.toISOString(),
      body: body ?? "",
    },
    null,
    2
  );
}
