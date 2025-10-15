import { NextRequest } from "next/server";
import { ensureAndFetchUserProfile } from "@/app/api/get-user-role/action";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get('avatar') as File;
  // TODO: upload to S3 / Cloudinary
  const url = `https://ui-avatars.com/api/?name=${file.name}&background=2E7D7D&color=fff`;
  return Response.json({ url });
}