import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
  Dimension,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

export const cloudwatchGetMetricsSchema = z.object({
  namespace: z.string().describe("CloudWatch namespace (e.g., AWS/EC2)"),
  metric_name: z.string().describe("Metric name (e.g., CPUUtilization)"),
  dimensions: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .describe("Metric dimensions"),
  period: z.number().optional().default(300).describe("Period in seconds (default: 300)"),
  start_time: z.string().describe("Start time in ISO 8601 format"),
  end_time: z.string().describe("End time in ISO 8601 format"),
});

export type CloudwatchGetMetricsInput = z.infer<typeof cloudwatchGetMetricsSchema>;

export async function cloudwatchGetMetrics(input: CloudwatchGetMetricsInput): Promise<string> {
  const client = new CloudWatchClient({ region: process.env.AWS_REGION ?? "us-east-1" });

  const dimensions: Dimension[] | undefined = input.dimensions?.map((d) => ({
    Name: d.name,
    Value: d.value,
  }));

  const command = new GetMetricStatisticsCommand({
    Namespace: input.namespace,
    MetricName: input.metric_name,
    Dimensions: dimensions,
    Period: input.period,
    StartTime: new Date(input.start_time),
    EndTime: new Date(input.end_time),
    Statistics: ["Average", "Sum", "Minimum", "Maximum"],
  });

  const response = await client.send(command);

  const datapoints = (response.Datapoints ?? []).map((dp) => ({
    timestamp: dp.Timestamp?.toISOString(),
    average: dp.Average,
    sum: dp.Sum,
    minimum: dp.Minimum,
    maximum: dp.Maximum,
    unit: dp.Unit,
  }));

  return JSON.stringify(
    {
      namespace: input.namespace,
      metricName: input.metric_name,
      datapoints,
    },
    null,
    2
  );
}
