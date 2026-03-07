import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

export const s3ListBucketsSchema = z.object({});

export type S3ListBucketsInput = z.infer<typeof s3ListBucketsSchema>;

export async function s3ListBuckets(_input: S3ListBucketsInput): Promise<string> {
  const client = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

  const command = new ListBucketsCommand({});
  const response = await client.send(command);

  const buckets = (response.Buckets ?? []).map((b) => ({
    name: b.Name,
    creationDate: b.CreationDate?.toISOString(),
  }));

  return JSON.stringify(buckets, null, 2);
}
