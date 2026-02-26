"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Package,
  Mail,
  CalendarDays,
  UserCog,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";

/* ---------------------------------- types --------------------------------- */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  group: string;
}

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface SidebarProps {
  user: SidebarUser;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/* ---------------------------------- data ---------------------------------- */

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/panel/dashboard", icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "SALES", "VIEWER"], group: "Main" },
  { label: "Appointments", href: "/panel/appointments", icon: Calendar, roles: ["OWNER", "ADMIN", "SALES", "VIEWER"], group: "Main" },
  { label: "Leads", href: "/panel/leads", icon: Users, roles: ["OWNER", "ADMIN", "SALES", "VIEWER"], group: "Main" },
  { label: "Sales", href: "/panel/sales", icon: DollarSign, roles: ["OWNER", "ADMIN", "SALES"], group: "Sales" },
  { label: "Inventory", href: "/panel/inventory", icon: Package, roles: ["OWNER", "ADMIN"], group: "Sales" },
  { label: "Mail Center", href: "/panel/mail", icon: Mail, roles: ["OWNER", "ADMIN", "SALES"], group: "Communication" },
  { label: "Calendar", href: "/panel/calendar", icon: CalendarDays, roles: ["OWNER", "ADMIN", "SALES"], group: "Communication" },
  { label: "Team", href: "/panel/team", icon: UserCog, roles: ["OWNER"], group: "Admin" },
  { label: "Audit Logs", href: "/panel/logs", icon: FileText, roles: ["OWNER", "ADMIN"], group: "Admin" },
];

/* --------------------------------- helpers -------------------------------- */

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeVariant(role?: string): "default" | "success" | "warning" | "info" {
  switch (role) {
    case "OWNER":
      return "warning";
    case "ADMIN":
      return "info";
    case "SALES":
      return "success";
    default:
      return "default";
  }
}

/* ----------------------------- sidebar content ---------------------------- */

function SidebarContent({
  user,
  collapsed,
  onToggle,
  onNavClick,
}: {
  user: SidebarUser;
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const userRole = user.role || "VIEWER";

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));
  const groups = Array.from(new Set(filteredItems.map((item) => item.group)));

  return (
    <div className="flex flex-col h-full bg-charcoal border-r border-slate">
      {/* Header - Toggle + Logo */}
      <div className={cn("flex items-center border-b border-slate h-16 shrink-0", collapsed ? "justify-center px-2" : "justify-between px-5")}>
        {!collapsed && (
          <Logo variant="horizontal" width={130} height={51} link={false} />
        )}
        {collapsed && (
          <Logo variant="square" width={36} height={36} link={false} />
        )}
        <button
          onClick={onToggle}
          className={cn(
            "hidden lg:flex items-center justify-center w-7 h-7 rounded-sm text-mist hover:text-brand-white hover:bg-slate transition-colors",
            collapsed && "absolute -right-3 top-5 bg-charcoal border border-slate z-10"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <p className="px-5 mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-mist/60">
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {filteredItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                          "flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-300 relative group",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "text-brand-white bg-slate/60 border-l-2 border-brand-gold"
                            : "text-mist hover:text-brand-white hover:bg-slate/30 border-l-2 border-transparent"
                        )}
                      >
                        <Icon size={18} className={cn("shrink-0", isActive && "text-brand-gold")} />
                        {!collapsed && <span>{item.label}</span>}
                        {collapsed && (
                          <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-slate text-brand-white rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-slate p-4 shrink-0">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-slate flex items-center justify-center text-xs font-medium text-brand-white shrink-0">
            {getInitials(user.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "User"}</p>
              <Badge variant={getRoleBadgeVariant(userRole)} className="mt-0.5 text-[10px] px-1.5 py-0">
                {userRole}
              </Badge>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/panel/login" })}
          className={cn(
            "flex items-center gap-2 w-full mt-3 text-sm text-mist hover:text-red-400 transition-colors py-1.5",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- export ----------------------------------- */

export function Sidebar({ user, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 h-screen z-40 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent user={user} collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onClose={onMobileClose} side="left" title="Navigation">
        <div className="-m-6 -mt-[73px] h-[calc(100%+73px)]">
          <SidebarContent user={user} collapsed={false} onToggle={onToggle} onNavClick={onMobileClose} />
        </div>
      </Sheet>
    </>
  );
}

/* ----------------------------- mobile trigger ----------------------------- */

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center justify-center w-9 h-9 rounded-sm text-mist hover:text-brand-white hover:bg-slate transition-colors"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
