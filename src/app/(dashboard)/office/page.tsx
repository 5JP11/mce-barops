"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ClipboardCheck, Clock, CheckCircle2, ChevronRight, XCircle, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

type Ticket = {
  id: string; ticketNumber: string; title: string;
  status: string; createdAt: string;
  branch: { name: string };
  owner: { name: string };
  materialItems: any[];
};

export default function OfficePortal() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/tickets?type=MATERIAL_REQUEST");
        if (res.ok) setRequests(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading office dashboard...</div>;

  const pending = requests.filter(r => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW");
  const approved = requests.filter(r => r.status === "APPROVED" || r.status === "FOR_PURCHASE" || r.status === "PURCHASED");

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Financial Oversight</p>
          <h1 className="text-4xl font-black text-white">Office <span className="text-teal-400">Review</span></h1>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-brand-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Review</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{pending.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-brand-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active POs</p>
          <p className="text-3xl font-black text-teal-400 mt-1">{approved.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-400">Needs Approval</h2>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center border border-dashed border-brand-border rounded-xl">No pending requests.</p>
            ) : pending.map((req) => (
              <Link key={req.id} href={`/tickets/${req.id}`}
                className="group glass-panel rounded-2xl p-5 border border-brand-border hover:border-teal-500/50 transition-all flex flex-col sm:flex-row sm:items-center gap-4">
                
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{req.ticketNumber}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {req.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white truncate">{req.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    From {req.branch.name} • {req.owner.name} • {req.materialItems.length} items
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-black text-white">
                    ${req.materialItems.reduce((acc, curr) => acc + (Number(curr.estimatedCost) || 0) * curr.quantity, 0).toFixed(2)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-all ml-2">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recently Approved / History sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Processing</h2>
          <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
            {approved.length === 0 ? (
               <p className="text-xs text-muted-foreground">No active procurement.</p>
            ) : approved.map((req) => (
               <div key={req.id} className="pb-3 border-b border-brand-border last:border-0 last:pb-0">
                 <div className="flex items-center justify-between mb-1">
                   <Link href={`/tickets/${req.id}`} className="text-xs font-bold text-white hover:text-teal-400 truncate">{req.ticketNumber}</Link>
                   <span className="text-[10px] text-muted-foreground">${req.materialItems.reduce((acc, curr) => acc + (Number(curr.estimatedCost) || 0) * curr.quantity, 0).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Clock className="w-3 h-3 text-teal-400" />
                   <span className="text-[10px] uppercase text-teal-400 tracking-widest">{req.status}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
