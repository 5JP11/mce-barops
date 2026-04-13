import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { generateTicketNumber } from "@/lib/tickets";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { branchId, ticketId, items, urgency, neededBy, reason } = body;

  if (!branchId || !items || !items.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate a parent MAT ticket for these items
  const ticketNumber = await generateTicketNumber("MATERIAL_REQUEST");

  const ticket = await db.ticket.create({
    data: {
      ticketNumber,
      title: `Material Request for ${items[0].itemName}${items.length > 1 ? ` and ${items.length - 1} more` : ""}`,
      description: reason || "Standard Material Requisition",
      type: "MATERIAL_REQUEST",
      status: "SUBMITTED",
      urgency: urgency || "NORMAL",
      branchId,
      ownerId: session.user.id,
      parentId: ticketId || null,
      materialItems: {
        create: items.map((i: any) => ({
          itemName: i.itemName,
          quantity: Number(i.quantity) || 1,
          unit: i.unit || "pcs",
          estimatedCost: i.estimatedCost ? Number(i.estimatedCost) : null,
          reason,
          neededBy: neededBy ? new Date(neededBy) : null,
          procurementStatus: "SUBMITTED",
        }))
      }
    },
    include: { materialItems: true }
  });

  // Log activity
  await db.activityLog.create({
    data: {
      ticketId: ticket.id,
      userId: session.user.id,
      action: "MATERIAL_REQUESTED",
      newValue: `Requested ${items.length} items.`,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
