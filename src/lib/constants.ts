export type UserRole = "SUPER_ADMIN" | "IT_ADMIN" | "BRANCH_MANAGER" | "STAFF" | "MAINTENANCE" | "OFFICE";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  IT_ADMIN: "IT Admin",
  BRANCH_MANAGER: "Branch Manager",
  STAFF: "Branch Staff",
  MAINTENANCE: "Maintenance Team",
  OFFICE: "Office / Purchasing",
};

export const TICKET_TYPES = ["IT_INCIDENT", "MATERIAL_REQUEST"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const IT_STATUSES = [
  "NEW", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS",
  "WAITING_BRANCH", "WAITING_PARTS", "RESOLVED", "CLOSED",
] as const;

export const MATERIAL_STATUSES = [
  "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED",
  "FOR_PURCHASE", "PURCHASED", "DELIVERED", "COMPLETED", "CANCELLED",
] as const;

export const URGENCY_LEVELS = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const URGENCY_COLORS: Record<string, string> = {
  LOW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  NORMAL: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gold-bright/15 text-gold-bright border-gold-bright/30",
  UNDER_REVIEW: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  ASSIGNED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  WAITING_BRANCH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  WAITING_PARTS: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CLOSED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  SUBMITTED: "bg-gold-bright/15 text-gold-bright border-gold-bright/30",
  APPROVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-300 border-red-500/30",
  FOR_PURCHASE: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  PURCHASED: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  DELIVERED: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export const CATEGORIES = [
  "EPOS / Tills",
  "Network / WiFi",
  "Sound System",
  "Lighting / DMX",
  "CCTV / Security",
  "HVAC / Climate",
  "Office Equipment",
  "Other",
];

export const UNITS = ["pcs", "meters", "liters", "boxes", "rolls", "sets", "kg", "pairs"];

export const BRANCH_LOCATIONS = [
  "Main Bar", "VIP Section", "DJ Booth", "Dance Floor",
  "Entry / Reception", "Back Office", "Kitchen", "Cellar / Storage",
  "Restrooms", "Outdoor Area", "Other",
];

export function canViewInternalNotes(role: string): boolean {
  return ["SUPER_ADMIN", "IT_ADMIN", "OFFICE"].includes(role);
}

export function canAssignTickets(role: string): boolean {
  return ["SUPER_ADMIN", "IT_ADMIN"].includes(role);
}

export function canApproveRequests(role: string): boolean {
  return ["SUPER_ADMIN", "OFFICE"].includes(role);
}

export function canCreateTickets(role: string): boolean {
  return ["SUPER_ADMIN", "IT_ADMIN", "BRANCH_MANAGER", "STAFF"].includes(role);
}

export function canCreateMaterialRequests(role: string): boolean {
  return ["SUPER_ADMIN", "MAINTENANCE", "BRANCH_MANAGER"].includes(role);
}
