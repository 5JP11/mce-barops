"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Camera, AlertCircle, Send, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TicketType, Urgency, URGENCY_LEVELS, CATEGORIES } from "@/lib/constants";

type Branch = { id: string; name: string };

export default function ReportPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    branchId: "",
    type: "IT_INCIDENT" as TicketType,
    urgency: "NORMAL" as Urgency,
    title: "",
    description: "",
    categoryId: "",
    issueLocation: "",
  });

  useEffect(() => {
    fetch("/api/branches").then((res) => res.json()).then(setBranches).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit ticket");
      }

      const ticket = await res.json();
      router.push(`/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-black text-foreground">
      <div className="sticky top-0 z-20 glass-panel px-4 py-3 flex items-center justify-center border-b border-brand-border">
        <span className="font-bold tracking-tight text-sm uppercase">Issue Report</span>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-8 pb-24">
        <header className="text-center py-4">
          <Logo showText={false} className="justify-center mb-2" />
          <h1 className="text-2xl font-bold">What is the <span className="gold-text">issue?</span></h1>
          <p className="text-muted-foreground text-sm">Select branch and describe the situation.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/30">{error}</div>}

          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Branch</label>
            <select required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all appearance-none cursor-pointer">
              <option value="" disabled>Select a branch...</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Issue Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, type: "IT_INCIDENT" })}
                className={cn("p-4 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all",
                  form.type === "IT_INCIDENT" ? "border-gold-bright bg-gold-bright/10 text-gold-bright" : "border-brand-border bg-brand-surface text-muted-foreground")}>
                <AlertCircle className="w-5 h-5" /> IT / Tech
              </button>
              <button type="button" onClick={() => setForm({ ...form, type: "MATERIAL_REQUEST" })}
                className={cn("p-4 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all",
                  form.type === "MATERIAL_REQUEST" ? "border-gold-bright bg-gold-bright/10 text-gold-bright" : "border-brand-border bg-brand-surface text-muted-foreground")}>
                <Wrench className="w-5 h-5" /> Maintenance
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Short Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Broken till screen"
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all" />
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Detailed Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened? What were you doing?" rows={4}
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all resize-none" />
          </div>

          {/* Location in Branch */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Exact Location</label>
            <input value={form.issueLocation} onChange={(e) => setForm({ ...form, issueLocation: e.target.value })}
              placeholder="e.g. Main Bar Left Station"
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all" />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Urgency</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {URGENCY_LEVELS.map((level) => (
                <button key={level} type="button" onClick={() => setForm({ ...form, urgency: level as Urgency })}
                  className={cn("py-2 rounded-lg text-xs font-bold border transition-all",
                    form.urgency === level 
                      ? (level === 'CRITICAL' ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-gold-bright bg-gold-bright/10 text-gold-bright")
                      : "border-brand-border bg-brand-surface text-muted-foreground"
                  )}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Placeholder */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Photos</label>
            <button type="button" className="w-full aspect-video bg-brand-surface border-2 border-dashed border-brand-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-brand-surface/80 hover:border-gold-bright/30 transition-all">
              <Camera className="w-8 h-8" />
              <span className="text-xs">Tap to capture / upload</span>
            </button>
          </div>

          {/* Submit */}
          <button disabled={loading} type="submit"
            className="w-full gold-gradient text-brand-black font-black py-4 rounded-xl shadow-lg shadow-gold-bright/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "SUBMITTING..." : "SUBMIT TICKET"}
          </button>
        </form>
      </main>
    </div>
  );
}
