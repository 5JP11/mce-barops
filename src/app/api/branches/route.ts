import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const branches = await db.branch.findMany({ select: { id: true, name: true } });
  return NextResponse.json(branches);
}
