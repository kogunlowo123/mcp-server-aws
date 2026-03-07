import { IAMClient, ListRolesCommand } from "@aws-sdk/client-iam";
import { z } from "zod";

export const iamListRolesSchema = z.object({
  path_prefix: z.string().optional().describe("Path prefix filter for roles"),
  max_items: z.number().optional().default(100).describe("Maximum number of roles to return"),
});

export type IamListRolesInput = z.infer<typeof iamListRolesSchema>;

export async function iamListRoles(input: IamListRolesInput): Promise<string> {
  const client = new IAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

  const command = new ListRolesCommand({
    PathPrefix: input.path_prefix,
    MaxItems: input.max_items,
  });

  const response = await client.send(command);

  const roles = (response.Roles ?? []).map((r) => ({
    roleName: r.RoleName,
    roleId: r.RoleId,
    arn: r.Arn,
    path: r.Path,
    createDate: r.CreateDate?.toISOString(),
    description: r.Description,
  }));

  return JSON.stringify(roles, null, 2);
}
