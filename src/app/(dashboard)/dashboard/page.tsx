"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Ticket as TicketIcon, Clock, AlertTriangle, ChevronRight, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { URGENCY_COLORS, STATUS_COLORS } from "@/lib/constants";

type Ticket = {
  id: string; ticketNumber: string; title: string; type: string;
  status: string; urgency: string; createdAt: string;
  branch: { name: string };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/tickets");
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tickets...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-white">My <span className="gold-text">Tickets</span></h1>
        <p className="text-muted-foreground text-sm">Tickets tracked for your branch.</p>
      </header>

      {tickets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border border-brand-border">
          <TicketIcon className="w-12 h-12 text-gold-muted mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No active tickets</h3>
          <p className="text-sm text-muted-foreground">You don't have any open issues right now.</p>
          <Link href="/report" className="inline-block mt-4 px-6 py-2 gold-gradient text-brand-black font-bold rounded-xl active:scale-[0.98] transition-all">
            Report an Issue
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <Link key={t.id} href={`/tickets/${t.id}`}
              className="group glass-panel rounded-2xl p-5 border border-brand-border hover:border-gold-bright/30 transition-all flex flex-col sm:flex-row gap-4 sm:items-center">
              
              <div className="flex items-center gap-4 flex-1">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", URGENCY_COLORS[t.urgency] || URGENCY_COLORS.NORMAL)}>
                  {t.urgency === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t.ticketNumber}</span>
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", STATUS_COLORS[t.status])}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-gold-bright transition-colors truncate text-sm sm:text-base">
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{t.branch.name}</span>
                    <span>&bull;</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2 sm:mt-0">
                <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center group-hover:bg-gold-bright/10 group-hover:text-gold-bright transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
