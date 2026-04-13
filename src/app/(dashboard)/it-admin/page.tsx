"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Search, Filter, Clock, MapPin, AlertTriangle, User, ChevronRight, LayoutDashboard 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { URGENCY_COLORS, STATUS_COLORS } from "@/lib/constants";

type Ticket = {
  id: string; ticketNumber: string; title: string; type: string;
  status: string; urgency: string; createdAt: string;
  branch: { name: string };
  owner: { name: string };
  assignee: { name: string } | null;
};

export default function ITAdminDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/tickets");
        if (res.ok) setTickets(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;

  const activeTickets = tickets.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED");
  const criticalTickets = tickets.filter(t => t.urgency === "CRITICAL" && t.status !== "CLOSED");
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS");

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-muted">Central Triage</p>
          <h1 className="text-4xl font-black text-white">IT <span className="gold-text">Queue</span></h1>
        </div>
      </header>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-brand-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Tickets</p>
          <p className="text-3xl font-black text-white mt-1">{activeTickets.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-brand-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Critical</p>
          <p className="text-3xl font-black text-red-500 mt-1">{criticalTickets.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-brand-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">In Progress</p>
          <p className="text-3xl font-black text-blue-400 mt-1">{inProgress.length}</p>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gold-muted px-1">Active Queue</h2>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}
              className="group glass-panel rounded-2xl p-5 border border-brand-border hover:border-gold-bright/20 transition-all flex flex-col lg:flex-row lg:items-center gap-6"
            >
              <div className="flex items-center gap-4 lg:w-48 shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  URGENCY_COLORS[ticket.urgency] || URGENCY_COLORS.NORMAL
                )}>
                  {ticket.urgency === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{ticket.ticketNumber}</p>
                  <p className="text-sm font-bold text-white truncate max-w-[120px]">{ticket.branch.name}</p>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white group-hover:text-gold-bright transition-colors truncate">
                  {ticket.title}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>By {ticket.owner.name}</span>
                  <span>&bull;</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {ticket.assignee && (
                    <>
                      <span>&bull;</span>
                      <span className="text-blue-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {ticket.assignee.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-brand-border">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    STATUS_COLORS[ticket.status] || STATUS_COLORS.NEW
                  )}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-brand-black border-brand-border text-muted-foreground">
                    {ticket.type === "IT_INCIDENT" ? "IT" : "MAINTENANCE"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
