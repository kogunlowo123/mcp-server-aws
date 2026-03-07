import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { z } from "zod";

export const stsGetCallerIdentitySchema = z.object({});

export type StsGetCallerIdentityInput = z.infer<typeof stsGetCallerIdentitySchema>;

export async function stsGetCallerIdentity(_input: StsGetCallerIdentityInput): Promise<string> {
  const client = new STSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

  const command = new GetCallerIdentityCommand({});
  const response = await client.send(command);

  return JSON.stringify(
    {
      account: response.Account,
      arn: response.Arn,
      userId: response.UserId,
    },
    null,
    2
  );
}
