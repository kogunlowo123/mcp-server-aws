import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ec2ListInstancesSchema, ec2ListInstances } from "./tools/ec2_list_instances";
import { s3ListBucketsSchema, s3ListBuckets } from "./tools/s3_list_buckets";
import { s3GetObjectSchema, s3GetObject } from "./tools/s3_get_object";
import { lambdaInvokeSchema, lambdaInvoke } from "./tools/lambda_invoke";
import { cloudwatchGetMetricsSchema, cloudwatchGetMetrics } from "./tools/cloudwatch_get_metrics";
import { iamListRolesSchema, iamListRoles } from "./tools/iam_list_roles";
import { stsGetCallerIdentitySchema, stsGetCallerIdentity } from "./tools/sts_get_caller_identity";

const server = new McpServer({
  name: "mcp-server-aws",
  version: "1.0.0",
});

server.tool(
  "ec2_list_instances",
  "List EC2 instances with optional filters by region and state",
  ec2ListInstancesSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await ec2ListInstances(input) }],
  })
);

server.tool(
  "s3_list_buckets",
  "List all S3 buckets in the AWS account",
  s3ListBucketsSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await s3ListBuckets(input) }],
  })
);

server.tool(
  "s3_get_object",
  "Retrieve an object from an S3 bucket by bucket name and key",
  s3GetObjectSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await s3GetObject(input) }],
  })
);

server.tool(
  "lambda_invoke",
  "Invoke an AWS Lambda function with an optional JSON payload",
  lambdaInvokeSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await lambdaInvoke(input) }],
  })
);

server.tool(
  "cloudwatch_get_metrics",
  "Retrieve CloudWatch metric statistics for a given namespace and metric",
  cloudwatchGetMetricsSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await cloudwatchGetMetrics(input) }],
  })
);

server.tool(
  "iam_list_roles",
  "List IAM roles in the AWS account with optional path prefix filter",
  iamListRolesSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await iamListRoles(input) }],
  })
);

server.tool(
  "sts_get_caller_identity",
  "Get the identity of the current AWS caller (account, ARN, user ID)",
  stsGetCallerIdentitySchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await stsGetCallerIdentity(input) }],
  })
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-server-aws running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
