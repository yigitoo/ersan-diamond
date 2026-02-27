"use client";

import { useState } from "react";
import { useSwrPaginated } from "@/lib/hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState("");
  const [entityType, setEntityType] = useState("");
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-serif text-xl">{t("İşlem Kayıtları", "Audit Logs")}</h2>
        <div className="flex items-center gap-3">
          <Select options={actionTypes} placeholder={t("Tüm İşlemler", "All Actions")} value={actionType} onChange={(e) => { setActionType(e.target.value); setPage(1); }} className="w-40" />
          <Select options={entityTypes} placeholder={t("Tüm Varlıklar", "All Entities")} value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="w-40" />
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
                <TableHead>{t("Detaylar", "Details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => (
                <TableRow key={log._id}>
                  <TableCell className="text-xs text-mist whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell className="text-xs">{log.actorRole}<br/><span className="text-mist">{log.actorUserId?.slice(-6)}</span></TableCell>
                  <TableCell><span className="text-xs bg-charcoal px-2 py-0.5 rounded">{log.actionType}</span></TableCell>
                  <TableCell className="text-xs">{log.entityType}<br/><span className="text-mist">{log.entityId?.slice(-6)}</span></TableCell>
                  <TableCell className="text-xs text-mist max-w-48 truncate">{log.route || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
