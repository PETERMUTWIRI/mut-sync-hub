import { prisma } from "@/lib/prisma";
import { DataGateway } from "@/lib/websocket";

export async function createNotification(orgId: string, data: {
      createdBy: orgId,
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isOrgWide?: boolean;
  userId?: string;
}) {
  const notif = await prisma.notification.create({
    data: {
      createdBy: orgId,
      ...data,
      type: data.type ?? "INFO",
      isOrgWide: data.isOrgWide ?? false,
      orgId,
      status: "UNREAD",
    },
  });
  // real-time push
  await DataGateway.broadcastToOrg(orgId, "notification:new", notif);
  return notif;
}
