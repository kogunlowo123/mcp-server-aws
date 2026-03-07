import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { z } from "zod";

export const lambdaInvokeSchema = z.object({
  function_name: z.string().describe("Lambda function name or ARN"),
  payload: z.string().optional().describe("JSON payload to send to the function"),
});

export type LambdaInvokeInput = z.infer<typeof lambdaInvokeSchema>;

export async function lambdaInvoke(input: LambdaInvokeInput): Promise<string> {
  const client = new LambdaClient({ region: process.env.AWS_REGION ?? "us-east-1" });

  const command = new InvokeCommand({
    FunctionName: input.function_name,
    Payload: input.payload ? Buffer.from(input.payload) : undefined,
  });

  const response = await client.send(command);

  const responsePayload = response.Payload
    ? Buffer.from(response.Payload).toString("utf-8")
    : null;

  return JSON.stringify(
    {
      statusCode: response.StatusCode,
      functionError: response.FunctionError,
      executedVersion: response.ExecutedVersion,
      payload: responsePayload ? JSON.parse(responsePayload) : null,
    },
    null,
    2
  );
}
