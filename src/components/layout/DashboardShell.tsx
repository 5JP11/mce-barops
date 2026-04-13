"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  Building2, LayoutDashboard, AlertCircle, Wrench, 
  ClipboardCheck, LogOut, Settings, Bell, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { useState } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) return <>{children}</>;

  const role = session.user.role as keyof typeof ROLE_LABELS;
  const isBranchUser = role === "STAFF" || role === "BRANCH_MANAGER";

  const navigation = [
    { name: "My Tickets", href: "/dashboard", icon: LayoutDashboard, show: isBranchUser },
    { name: "New Issue", href: "/report", icon: AlertCircle, show: isBranchUser },
    { name: "IT Triage", href: "/it-admin", icon: LayoutDashboard, show: role === "SUPER_ADMIN" || role === "IT_ADMIN" },
    { name: "Maintenance Base", href: "/maintenance", icon: Wrench, show: role === "SUPER_ADMIN" || role === "MAINTENANCE" || role === "BRANCH_MANAGER" },
    { name: "Office Review", href: "/office", icon: ClipboardCheck, show: role === "SUPER_ADMIN" || role === "OFFICE" },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-brand-black text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-50 glass-panel border-b border-brand-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gold-bright" />
          <span className="font-bold tracking-tight text-white">MCE BarOps</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-brand-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-bright/10">
            <Building2 className="w-6 h-6 text-brand-black" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">MCE BarOps</h1>
            <p className="text-[10px] text-gold-muted uppercase tracking-widest">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 md:py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-brand-surface border border-brand-border text-white shadow-sm" 
                    : "text-muted-foreground hover:text-white hover:bg-brand-surface/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-gold-bright" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-brand-border">
          <div className="bg-brand-surface rounded-xl p-3 border border-brand-border space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-black border border-brand-border flex items-center justify-center text-xs font-bold text-gold-bright">
                {session.user.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session.user.branchName || "HQ"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 pt-2 border-t border-brand-border/50">
              <button className="flex-1 py-1.5 flex justify-center text-muted-foreground hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button className="flex-1 py-1.5 flex justify-center text-muted-foreground hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex-1 py-1.5 flex justify-center text-red-500/70 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
