import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/verification-tokens";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
  }

  const valid = await consumeToken("verify", email, token);
  if (!valid) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
  }

  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });

  return NextResponse.redirect(new URL("/verify-email?status=success", request.url));
}
