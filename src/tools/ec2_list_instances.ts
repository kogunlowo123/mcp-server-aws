import { EC2Client, DescribeInstancesCommand, Filter } from "@aws-sdk/client-ec2";
import { z } from "zod";

export const ec2ListInstancesSchema = z.object({
  region: z.string().optional().describe("AWS region override"),
  filters: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional()
    .describe("EC2 filters (e.g., instance-state-name)"),
});

export type Ec2ListInstancesInput = z.infer<typeof ec2ListInstancesSchema>;

export async function ec2ListInstances(input: Ec2ListInstancesInput): Promise<string> {
  const client = new EC2Client({ region: input.region ?? process.env.AWS_REGION ?? "us-east-1" });

  const filters: Filter[] | undefined = input.filters?.map((f) => ({
    Name: f.name,
    Values: f.values,
  }));

  const command = new DescribeInstancesCommand({ Filters: filters });
  const response = await client.send(command);

  const instances = (response.Reservations ?? []).flatMap((r) =>
    (r.Instances ?? []).map((i) => ({
      instanceId: i.InstanceId,
      state: i.State?.Name,
      type: i.InstanceType,
      publicIp: i.PublicIpAddress,
      privateIp: i.PrivateIpAddress,
      launchTime: i.LaunchTime?.toISOString(),
      tags: Object.fromEntries((i.Tags ?? []).map((t) => [t.Key, t.Value])),
    }))
  );

  return JSON.stringify(instances, null, 2);
}
