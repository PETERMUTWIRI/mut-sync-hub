import { prisma } from "@/lib/prisma";
import { DataGateway } from "@/lib/websocket";

export async function createNotification(orgId: string, data: {
  createdBy: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isOrgWide?: boolean;
  userId?: string;
}) {
  const notif = await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type ?? "INFO",
      isOrgWide: data.isOrgWide ?? false,
      userId: data.userId,
      createdBy: data.createdBy || orgId,
      orgId,
      status: "UNREAD",
    },
  });
  // real-time push
  await DataGateway.broadcastToOrg(orgId, "notification:new", notif);
  return notif;
}
