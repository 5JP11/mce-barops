import { db } from "@/lib/db";

let counter = 0;

export async function generateTicketNumber(type: "IT_INCIDENT" | "MATERIAL_REQUEST"): Promise<string> {
  const prefix = type === "IT_INCIDENT" ? "INC" : "MAT";
  const count = await db.ticket.count({ where: { type } });
  const num = (count + 1).toString().padStart(4, "0");
  return `${prefix}-${num}`;
}
