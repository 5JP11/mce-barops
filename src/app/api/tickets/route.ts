import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { generateTicketNumber } from "@/lib/tickets";

// GET /api/tickets - List tickets with filtering
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const status = searchParams.get("status");
  const urgency = searchParams.get("urgency");
  const type = searchParams.get("type");
  const assigneeId = searchParams.get("assigneeId");
  const mine = searchParams.get("mine");

  const where: any = {};

  // Branch-based access: Staff/Manager can only see their branch
  if (["STAFF", "BRANCH_MANAGER"].includes(session.user.role) && session.user.branchId) {
    where.branchId = session.user.branchId;
  }
  // Staff can only see own tickets
  if (session.user.role === "STAFF" && mine !== "false") {
    where.ownerId = session.user.id;
  }

  if (branchId) where.branchId = branchId;
  if (status) where.status = status;
  if (urgency) where.urgency = urgency;
  if (type) where.type = type;
  if (assigneeId) where.assigneeId = assigneeId;

  const tickets = await db.ticket.findMany({
    where,
    include: {
      branch: true,
      category: true,
      asset: true,
      owner: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      materialItems: true,
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets - Create a new ticket
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, urgency, branchId, categoryId, assetId, issueLocation, issueStarted } = body;

  if (!title || !description || !type || !branchId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ticketNumber = await generateTicketNumber(type);

  const ticket = await db.ticket.create({
    data: {
      ticketNumber,
      title,
      description,
      type,
      urgency: urgency || "NORMAL",
      status: type === "MATERIAL_REQUEST" ? "SUBMITTED" : "NEW",
      branchId,
      categoryId: categoryId || null,
      assetId: assetId || null,
      ownerId: session.user.id,
      issueLocation: issueLocation || null,
      issueStarted: issueStarted ? new Date(issueStarted) : null,
    },
    include: { branch: true, owner: { select: { id: true, name: true } } },
  });

  // Activity log
  await db.activityLog.create({
    data: {
      ticketId: ticket.id,
      userId: session.user.id,
      action: "TICKET_CREATED",
      newValue: ticketNumber,
    },
  });

  // Notify IT admins for critical tickets
  if (urgency === "CRITICAL") {
    const admins = await db.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "IT_ADMIN"] } } });
    await db.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: "🚨 Critical Ticket",
        message: `${ticket.ticketNumber}: ${title} at ${ticket.branch.name}`,
        link: `/tickets/${ticket.id}`,
      })),
    });
  }

  return NextResponse.json(ticket, { status: 201 });
}
