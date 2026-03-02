"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar, MobileMenuButton } from "@/components/panel/sidebar";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

const NAV_LABELS: Record<string, { tr: string; en: string }> = {
  "/panel/dashboard": { tr: "Kontrol Paneli", en: "Dashboard" },
  "/panel/appointments": { tr: "Randevular", en: "Appointments" },
  "/panel/leads": { tr: "Müşteri Adayları", en: "Leads" },
  "/panel/sales": { tr: "Satışlar", en: "Sales" },
  "/panel/inventory": { tr: "Envanter", en: "Inventory" },
  "/panel/team": { tr: "Ekip", en: "Team" },
  "/panel/mail": { tr: "Posta Merkezi", en: "Mail Center" },
  "/panel/calendar": { tr: "Takvim", en: "Calendar" },
  "/panel/logs": { tr: "İşlem Kayıtları", en: "Audit Logs" },
};

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

  const getPageTitle = () => {
    const match = Object.entries(NAV_LABELS).find(([href]) => pathname.startsWith(href));
    return match ? t(match[1].tr, match[1].en) : t("Panel", "Panel");
  };

  const sidebarUser = {
    name: session?.user?.name,
    email: session?.user?.email,
    role: userRole,
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <Sidebar
        user={sidebarUser}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content — offset by sidebar width on desktop */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
      )}>
        {/* Topbar */}
        <header className="h-14 sm:h-16 border-b border-slate/30 flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 bg-brand-black/95 backdrop-blur-sm z-30">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <h1 className="text-sm font-medium tracking-wider uppercase text-mist truncate">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageToggle />
            <span className="text-xs text-mist hidden sm:inline">{session?.user?.name}</span>
            <span className="text-xs bg-charcoal text-brand-gold px-2 py-0.5 rounded-full">{userRole}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
