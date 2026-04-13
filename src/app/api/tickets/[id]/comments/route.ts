import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

// POST /api/tickets/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content, isInternal } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  // Only admins can post internal notes
  if (isInternal && !["SUPER_ADMIN", "IT_ADMIN", "OFFICE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized for internal notes" }, { status: 403 });
  }

  const comment = await db.comment.create({
    data: {
      content: content.trim(),
      isInternal: isInternal || false,
      ticketId: id,
      userId: session.user.id,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  await db.activityLog.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      action: isInternal ? "INTERNAL_NOTE" : "COMMENT_ADDED",
      newValue: content.substring(0, 100),
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
