"use client";

import { useSwrFetch } from "@/lib/hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPrice, formatDateTime, formatRelative } from "@/lib/utils/formatters";
import { DollarSign, Users, Calendar, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { data, isLoading } = useSwrFetch<any>("/api/dashboard");
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const recentLeads = data?.recentLeads || [];
  const upcomingAppointments = data?.upcomingAppointments || [];

  const kpiCards = [
    { label: t("Bugünkü Satışlar", "Today's Sales"), value: kpis.todaySales || 0, icon: TrendingUp, color: "text-green-400" },
    { label: t("Ciro", "Revenue"), value: formatPrice(kpis.todayRevenue || 0), icon: DollarSign, color: "text-brand-gold" },
    { label: t("Yeni Müşteri Adayları", "New Leads"), value: kpis.newLeads || 0, icon: Users, color: "text-blue-400" },
    { label: t("Randevular", "Appointments"), value: kpis.todayAppointments || 0, icon: Calendar, color: "text-purple-400" },
    { label: t("Envanter Değeri", "Inventory Value"), value: formatPrice(kpis.inventoryValue || 0), icon: Package, color: "text-mist" },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-xs text-mist tracking-wider uppercase mb-2">{kpi.label}</p>
                <p className="text-2xl font-serif">{kpi.value}</p>
              </div>
              <kpi.icon size={20} className={kpi.color} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-wider uppercase text-mist">{t("Yaklaşan Randevular", "Upcoming Appointments")}</h3>
              <Link href="/panel/appointments" className="text-xs text-brand-gold hover:underline">{t("Tümünü Gör", "View All")}</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-mist text-sm">{t("Yaklaşan randevu yok", "No upcoming appointments")}</p>
            ) : (
              upcomingAppointments.map((appt: any) => (
                <div key={appt._id} className="flex items-center justify-between py-2 border-b border-slate/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{appt.customerName}</p>
                    <p className="text-xs text-mist">{formatDateTime(appt.datetimeStart)}</p>
                  </div>
                  <StatusBadge status={appt.status} type="appointment" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-wider uppercase text-mist">{t("Son Müşteri Adayları", "Recent Leads")}</h3>
              <Link href="/panel/leads" className="text-xs text-brand-gold hover:underline">{t("Tümünü Gör", "View All")}</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-mist text-sm">{t("Yeni müşteri adayı yok", "No recent leads")}</p>
            ) : (
              recentLeads.map((lead: any) => (
                <div key={lead._id} className="flex items-center justify-between py-2 border-b border-slate/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-mist">{lead.type} · {formatRelative(lead.createdAt)}</p>
                  </div>
                  <StatusBadge status={lead.status} type="lead" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
