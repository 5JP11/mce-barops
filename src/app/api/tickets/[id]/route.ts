import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { canViewInternalNotes } from "@/lib/constants";

// GET /api/tickets/[id] - Get ticket detail
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      branch: true,
      category: true,
      asset: true,
      owner: { select: { id: true, name: true, email: true, role: true, phone: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      comments: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: true,
      materialItems: true,
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      parent: { select: { id: true, ticketNumber: true, title: true } },
      children: { select: { id: true, ticketNumber: true, title: true, status: true, type: true } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // Filter internal comments for non-admin users
  if (!canViewInternalNotes(session.user.role)) {
    ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    ticket.internalNotes = null;
  }

  return NextResponse.json(ticket);
}

// PATCH /api/tickets/[id] - Update ticket (status, assignment, notes)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, assigneeId, internalNotes, urgency } = body;

  const existing = await db.ticket.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const data: any = {};
  const logs: any[] = [];

  if (status && status !== existing.status) {
    data.status = status;
    logs.push({ ticketId: id, userId: session.user.id, action: "STATUS_CHANGE", oldValue: existing.status, newValue: status });
  }

  if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
    data.assigneeId = assigneeId;
    logs.push({ ticketId: id, userId: session.user.id, action: "ASSIGNED", oldValue: existing.assigneeId, newValue: assigneeId });
  }

  if (internalNotes !== undefined) {
    data.internalNotes = internalNotes;
  }

  if (urgency && urgency !== existing.urgency) {
    data.urgency = urgency;
    logs.push({ ticketId: id, userId: session.user.id, action: "URGENCY_CHANGE", oldValue: existing.urgency, newValue: urgency });
  }

  const updated = await db.ticket.update({ where: { id }, data });

  if (logs.length > 0) {
    await db.activityLog.createMany({ data: logs });
  }

  // Notify assignee
  if (assigneeId && assigneeId !== existing.assigneeId) {
    await db.notification.create({
      data: {
        userId: assigneeId,
        title: "Ticket Assigned",
        message: `You have been assigned to ${existing.ticketNumber}: ${existing.title}`,
        link: `/tickets/${id}`,
      },
    });
  }

  return NextResponse.json(updated);
}
