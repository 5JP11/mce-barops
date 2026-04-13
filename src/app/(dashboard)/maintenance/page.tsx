"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Package, ShoppingCart, Plus, Trash2, 
  History, Loader2, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UNITS, URGENCY_LEVELS, Urgency } from "@/lib/constants";

export default function MaintenancePortal() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [branches, setBranches] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    branchId: session?.user.branchId || "",
    urgency: "NORMAL" as Urgency,
    reason: "",
    neededBy: "",
    items: [{ itemName: "", quantity: 1, unit: "pcs", estimatedCost: "" }]
  });

  useEffect(() => {
    fetch("/api/branches").then(r => r.json()).then(setBranches);
    fetch("/api/tickets?type=MATERIAL_REQUEST")
      .then(r => r.json())
      .then(data => setRecentRequests(data.slice(0, 5)));
  }, []);

  const totalCost = form.items.reduce((acc, curr) => acc + (Number(curr.estimatedCost) || 0) * curr.quantity, 0);

  const addItem = () => setForm({ ...form, items: [...form.items, { itemName: "", quantity: 1, unit: "pcs", estimatedCost: "" }] });
  const removeItem = (index: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.branchId || form.items.length === 0 || form.items.some(i => !i.itemName)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/material-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/tickets/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-white">Stock & <span className="gold-text">Procurement</span></h1>
        <p className="text-muted-foreground text-sm">Request materials for repairs or venue maintenance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Request Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-brand-border space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold-bright" />
              New Material Request
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Destination Branch</label>
                <select required value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}
                  className="w-full bg-brand-black border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all appearance-none">
                  <option value="" disabled>Select output branch...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Needed By Date</label>
                <input type="date" value={form.neededBy} onChange={e => setForm({...form, neededBy: e.target.value})}
                  className="w-full bg-brand-black border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Purpose / Reason</label>
              <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                placeholder="Why do we need this?" rows={2}
                className="w-full bg-brand-black border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-bright transition-all resize-none" />
            </div>

            {/* Items List */}
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-muted px-1">Items to Order</label>
              
              <div className="space-y-3">
                {form.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input required placeholder="Item name / Specs" value={item.itemName} onChange={e => updateItem(i, "itemName", e.target.value)}
                      className="flex-1 w-full bg-brand-black border border-brand-border rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-gold-bright" />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input type="number" min="1" step="0.5" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)}
                        className="w-20 bg-brand-black border border-brand-border rounded-xl px-3 py-2 text-sm text-center focus:ring-1 focus:ring-gold-bright" />
                      <select value={item.unit} onChange={e => updateItem(i, "unit", e.target.value)}
                        className="w-24 bg-brand-black border border-brand-border rounded-xl px-2 py-2 text-sm appearance-none text-center">
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <input type="number" min="0" step="0.01" placeholder="Est $" value={item.estimatedCost} onChange={e => updateItem(i, "estimatedCost", e.target.value)}
                        className="w-24 bg-brand-black border border-brand-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-gold-bright" />
                      <button type="button" onClick={() => removeItem(i)} disabled={form.items.length === 1}
                        className="p-2 text-red-500/50 hover:text-red-500 transition-colors disabled:opacity-20 shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addItem}
                className="w-full py-3 rounded-xl border border-dashed border-brand-border text-xs font-bold text-muted-foreground hover:bg-brand-surface hover:text-gold-bright transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> ADD LINE ITEM
              </button>
            </div>

            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Total</p>
                <p className="text-2xl font-black text-white">${totalCost.toFixed(2)}</p>
              </div>
              <button disabled={loading} type="submit"
                className="px-8 py-3 gold-gradient text-brand-black font-black rounded-xl shadow-lg shadow-gold-bright/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                SUBMIT FOR APPROVAL
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar Info/History */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-brand-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-gold-bright" /> Recent Requests
            </h3>
            <div className="space-y-4">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between text-xs pb-3 border-b border-brand-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-white max-w-[120px] truncate">{req.title}</p>
                    <p className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{req.ticketNumber}</p>
                    <p className="font-bold uppercase tracking-widest text-[8px] text-teal-400">{req.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
