"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock, MapPin, User, MessageSquare, Send, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { URGENCY_COLORS, STATUS_COLORS, canViewInternalNotes } from "@/lib/constants";

export default function TicketDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);

  async function loadTicket() {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) setTicket(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, isInternal }),
      });
      if (res.ok) {
        setComment("");
        setIsInternal(false);
        loadTicket(); // Refresh
      }
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-400">Ticket not found.</div>;

  const allowInternal = session && canViewInternalNotes(session.user.role);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" /> Back to List
      </Link>

      {/* Header Info */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-brand-surface border border-brand-border text-gold-muted">
                {ticket.ticketNumber}
              </span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border", STATUS_COLORS[ticket.status] || STATUS_COLORS.NEW)}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-1", URGENCY_COLORS[ticket.urgency] || URGENCY_COLORS.NORMAL)}>
                {ticket.urgency === 'CRITICAL' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {ticket.urgency}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{ticket.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-brand-border">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Branch</p>
            <p className="text-sm font-bold text-white flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-bright" /> {ticket.branch.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Type</p>
            <p className="text-sm font-bold text-white">{ticket.type === "IT_INCIDENT" ? "IT / Tech" : "Maintenance"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Submitted By</p>
            <p className="text-sm font-bold text-white flex items-center gap-1"><User className="w-3 h-3 text-muted-foreground" /> {ticket.owner.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Assigned To</p>
            <p className="text-sm font-bold text-blue-400">
              {ticket.assignee ? ticket.assignee.name : "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-muted border-b border-brand-border/50 pb-2">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Comments Thread */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Activity & Comments</h3>
            
            <div className="space-y-4">
              {ticket.comments.map((c: any) => (
                <div key={c.id} className={cn("p-4 rounded-2xl border", c.isInternal ? "bg-amber-500/5 border-amber-500/20" : "bg-brand-surface border-brand-border")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <User className="w-3 h-3" /> {c.user.name}
                      {c.isInternal && <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest bg-amber-500/20 text-amber-500 font-black">Internal Note</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={postComment} className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..." rows={3}
                className={cn("w-full bg-brand-black border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all resize-none text-sm", isInternal && "border-amber-500/50 focus:ring-amber-500 text-amber-100")}
              />
              <div className="flex items-center justify-between">
                {allowInternal ? (
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-500/80 hover:text-amber-500 transition-colors">
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded border-brand-border bg-brand-surface text-amber-500 focus:ring-amber-500" />
                    Internal Note (Hidden from Branch)
                  </label>
                ) : <div />}
                <button disabled={posting || !comment.trim()} type="submit"
                  className="px-6 py-2 gold-gradient text-brand-black font-bold rounded-xl text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-muted border-b border-brand-border/50 pb-2">Asset details</h3>
            {ticket.asset ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-white">{ticket.asset.name}</p>
                <p className="text-xs text-muted-foreground">Location: {ticket.asset.location}</p>
                <p className="text-[10px] uppercase text-muted-foreground bg-brand-surface px-2 py-1 rounded w-fit">{ticket.category?.name}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific asset linked.</p>
            )}
          </div>
          
          {ticket.materialItems && ticket.materialItems.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-teal-500/30 space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 border-b border-teal-500/20 pb-2">Procurement Request</h3>
               <div className="space-y-3">
                 {ticket.materialItems.map((item: any) => (
                   <div key={item.id} className="text-sm border-b border-teal-500/10 pb-2 last:border-0 last:pb-0">
                     <p className="font-bold text-white">{item.quantity} {item.unit} x {item.itemName}</p>
                     <div className="flex items-center justify-between mt-1">
                       <span className="text-[10px] uppercase px-1.5 py-0.5 border border-teal-500/30 text-teal-300 rounded bg-teal-500/10">
                         {item.procurementStatus}
                       </span>
                       <span className="text-muted-foreground text-xs">${item.estimatedCost?.toFixed(2)}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
