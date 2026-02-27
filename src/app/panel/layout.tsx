"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, Users, Package, ShoppingBag, Mail,
  UserCircle, ClipboardList, ScrollText, ChevronLeft, ChevronRight,
  LogOut, Menu
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface NavItemDef {
  href: string;
  icon: typeof LayoutDashboard;
  labelTr: string;
  labelEn: string;
  roles: string[];
}

const NAV_ITEMS: NavItemDef[] = [
  { href: "/panel/dashboard", icon: LayoutDashboard, labelTr: "Kontrol Paneli", labelEn: "Dashboard", roles: ["OWNER", "ADMIN", "SALES", "VIEWER"] },
  { href: "/panel/appointments", icon: Calendar, labelTr: "Randevular", labelEn: "Appointments", roles: ["OWNER", "ADMIN", "SALES", "VIEWER"] },
  { href: "/panel/leads", icon: Users, labelTr: "Müşteri Adayları", labelEn: "Leads", roles: ["OWNER", "ADMIN", "SALES", "VIEWER"] },
  { href: "/panel/sales", icon: ShoppingBag, labelTr: "Satışlar", labelEn: "Sales", roles: ["OWNER", "ADMIN", "SALES"] },
  { href: "/panel/inventory", icon: Package, labelTr: "Envanter", labelEn: "Inventory", roles: ["OWNER", "ADMIN"] },
  { href: "/panel/team", icon: UserCircle, labelTr: "Ekip", labelEn: "Team", roles: ["OWNER"] },
  { href: "/panel/mail", icon: Mail, labelTr: "Posta Merkezi", labelEn: "Mail Center", roles: ["OWNER", "ADMIN", "SALES"] },
  { href: "/panel/calendar", icon: ClipboardList, labelTr: "Takvim", labelEn: "Calendar", roles: ["OWNER", "ADMIN", "SALES"] },
  { href: "/panel/logs", icon: ScrollText, labelTr: "İşlem Kayıtları", labelEn: "Audit Logs", roles: ["OWNER", "ADMIN"] },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const userRole = (session?.user as any)?.role || "VIEWER";

  // Don't show sidebar on login page
  if (pathname === "/panel/login") {
    return <>{children}</>;
  }

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const getNavLabel = (item: NavItemDef) => t(item.labelTr, item.labelEn);

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-slate/30 bg-brand-black transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate/30">
          {!collapsed && <Logo variant="horizontal" width={120} height={47} />}
          <button onClick={() => setCollapsed(!collapsed)} className="text-mist hover:text-brand-white transition-colors">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const label = getNavLabel(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                  isActive ? "bg-charcoal text-brand-white" : "text-mist hover:text-brand-white hover:bg-charcoal/50"
                )}
                title={collapsed ? label : undefined}
              >
                <item.icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate/30">
          <button
            onClick={() => signOut({ callbackUrl: "/panel/login" })}
            className="flex items-center gap-3 text-mist hover:text-red-400 transition-colors text-sm w-full"
          >
            <LogOut size={18} />
            {!collapsed && <span>{t("Çıkış", "Logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-slate/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-mist hover:text-brand-white">
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-medium tracking-wider uppercase text-mist">
              {(() => {
                const match = filteredNav.find((n) => pathname.startsWith(n.href));
                return match ? getNavLabel(match) : t("Panel", "Panel");
              })()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="text-xs text-mist">{session?.user?.name}</span>
            <span className="text-xs bg-charcoal text-brand-gold px-2 py-0.5 rounded-full">{userRole}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-brand-black border-r border-slate/30 p-4">
            <Logo variant="horizontal" width={120} height={47} className="mb-6" />
            <nav className="space-y-1">
              {filteredNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const label = getNavLabel(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                      isActive ? "bg-charcoal text-brand-white" : "text-mist hover:text-brand-white"
                    )}
                  >
                    <item.icon size={18} /> {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
