"use client";

import { useState } from "react";
import { useSwrPaginated } from "@/lib/hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/formatters";
import { Shield, Globe, Monitor, Route } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function parseUserAgent(ua?: string): { browser: string; os: string } {
  if (!ua) return { browser: "-", os: "-" };
  let browser = "-";
  let os = "-";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Browser detection
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

  return { browser, os };
}

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { t } = useI18n();

  const { data, isLoading } = useSwrPaginated("/api/logs", {
    page, limit: 30,
    actionType: actionType || undefined,
    entityType: entityType || undefined,
  });
  const logs = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  const actionTypes = [
    { value: "AUTH:login", label: t("Giriş", "Login") },
    { value: "AUTH:logout", label: t("Çıkış", "Logout") },
    { value: "AUTH:failed_login", label: t("Başarısız Giriş", "Failed Login") },
    { value: "CRUD:create", label: t("Oluşturma", "Create") },
    { value: "CRUD:update", label: t("Güncelleme", "Update") },
    { value: "CRUD:delete", label: t("Silme", "Delete") },
    { value: "EMAIL:sent", label: t("E-posta Gönderildi", "Email Sent") },
  ];

  const entityTypes = [
    { value: "Product", label: t("Ürün", "Product") },
    { value: "Lead", label: t("Müşteri Adayı", "Lead") },
    { value: "Appointment", label: t("Randevu", "Appointment") },
    { value: "Sale", label: t("Satış", "Sale") },
    { value: "User", label: t("Kullanıcı", "User") },
    { value: "CalendarEvent", label: t("Takvim", "Calendar Event") },
    { value: "EmailThread", label: t("E-posta Dizisi", "Email Thread") },
    { value: "Delivery", label: t("Teslimat", "Delivery") },
  ];

  const openDetail = (log: any) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  const getActorName = (log: any) => {
    if (typeof log.actorUserId === "object") {
      return log.actorUserId?.name || log.actorUserId?.email || "-";
    }
    return log.actorUserId?.slice?.(-6) || "-";
  };

  const isSecurityEvent = (actionType: string) =>
    actionType.startsWith("AUTH:") || actionType.startsWith("SETTINGS:");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("İşlem Kayıtları", "Audit Logs")}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Select options={actionTypes} placeholder={t("Tüm İşlemler", "All Actions")} value={actionType} onChange={(e) => { setActionType(e.target.value); setPage(1); }} className="w-full sm:w-40" />
          <Select options={entityTypes} placeholder={t("Tüm Varlıklar", "All Entities")} value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Zaman", "Time")}</TableHead>
                <TableHead>{t("Kullanıcı", "Actor")}</TableHead>
                <TableHead>{t("İşlem", "Action")}</TableHead>
                <TableHead>{t("Varlık", "Entity")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("IP", "IP")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("Tarayıcı", "Browser")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("Detaylar", "Details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => {
                const { browser } = parseUserAgent(log.userAgent);
                return (
                  <TableRow
                    key={log._id}
                    className="cursor-pointer hover:bg-charcoal/50 transition-colors"
                    onClick={() => openDetail(log)}
                  >
                    <TableCell className="text-xs text-mist whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell className="text-xs">{log.actorRole}<br/><span className="text-mist">{getActorName(log)}</span></TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded ${isSecurityEvent(log.actionType) ? "bg-red-500/10 text-red-400" : "bg-charcoal"}`}>
                        {log.actionType}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{log.entityType}<br/><span className="text-mist">{log.entityId?.slice(-6)}</span></TableCell>
                    <TableCell className="text-xs text-mist font-mono hidden md:table-cell">{log.ip || "-"}</TableCell>
                    <TableCell className="text-xs text-mist hidden lg:table-cell">{browser}</TableCell>
                    <TableCell className="text-xs text-mist max-w-48 truncate hidden md:table-cell">{log.route || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedLog(null); }}
        title={t("İşlem Detayı", "Audit Log Detail")}
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Security event flag */}
            {isSecurityEvent(selectedLog.actionType) && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-sm p-3">
                <Shield size={16} className="text-red-400" />
                <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                  {t("Güvenlik Olayı", "Security Event")}
                </span>
              </div>
            )}

            {/* Action info */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1">{t("İşlem", "Action")}</p>
              <span className={`text-sm px-2.5 py-1 rounded ${isSecurityEvent(selectedLog.actionType) ? "bg-red-500/10 text-red-400" : "bg-charcoal text-brand-white"}`}>
                {selectedLog.actionType}
              </span>
            </div>

            {/* Actor */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1">{t("Kullanıcı", "Actor")}</p>
              <p className="text-sm">{getActorName(selectedLog)}</p>
              <p className="text-xs text-mist">{selectedLog.actorRole}</p>
            </div>

            {/* Timestamp */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1">{t("Zaman", "Timestamp")}</p>
              <p className="text-sm font-mono">{formatDateTime(selectedLog.createdAt)}</p>
            </div>

            {/* Entity */}
            {selectedLog.entityType && (
              <div>
                <p className="text-xs text-mist uppercase tracking-wider mb-1">{t("Varlık", "Entity")}</p>
                <p className="text-sm">{selectedLog.entityType}</p>
                {selectedLog.entityId && (
                  <p className="text-xs text-mist font-mono mt-0.5">ID: {selectedLog.entityId}</p>
                )}
              </div>
            )}

            {/* IP Address */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe size={12} /> {t("IP Adresi", "IP Address")}
              </p>
              <p className="text-sm font-mono bg-charcoal px-3 py-2 rounded-sm border border-slate/30">
                {selectedLog.ip || t("Bilinmiyor", "Unknown")}
              </p>
            </div>

            {/* User Agent */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Monitor size={12} /> {t("Cihaz Bilgisi", "Device Info")}
              </p>
              {(() => {
                const { browser, os } = parseUserAgent(selectedLog.userAgent);
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-mist">{t("Tarayıcı", "Browser")}:</span>
                      <span>{browser}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-mist">{t("İşletim Sistemi", "OS")}:</span>
                      <span>{os}</span>
                    </div>
                    {selectedLog.userAgent && (
                      <p className="text-[10px] text-mist/60 font-mono break-all mt-2 bg-charcoal p-2 rounded-sm border border-slate/20">
                        {selectedLog.userAgent}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Route */}
            {selectedLog.route && (
              <div>
                <p className="text-xs text-mist uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Route size={12} /> {t("Yol", "Route")}
                </p>
                <p className="text-sm font-mono bg-charcoal px-3 py-2 rounded-sm border border-slate/30">
                  {selectedLog.route}
                </p>
              </div>
            )}

            {/* Before / After diff */}
            {(selectedLog.before || selectedLog.after) && (
              <div>
                <p className="text-xs text-mist uppercase tracking-wider mb-2">{t("Değişiklikler", "Changes")}</p>
                <div className="grid grid-cols-1 gap-3">
                  {selectedLog.before && (
                    <div>
                      <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">{t("Öncesi", "Before")}</p>
                      <pre className="text-xs font-mono bg-charcoal p-3 rounded-sm border border-slate/30 overflow-x-auto max-h-40 text-red-300/70">
                        {JSON.stringify(selectedLog.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.after && (
                    <div>
                      <p className="text-[10px] text-green-400 uppercase tracking-wider mb-1">{t("Sonrası", "After")}</p>
                      <pre className="text-xs font-mono bg-charcoal p-3 rounded-sm border border-slate/30 overflow-x-auto max-h-40 text-green-300/70">
                        {JSON.stringify(selectedLog.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
