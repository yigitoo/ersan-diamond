"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/formatters";
import { SERVICE_TYPE_LABELS } from "@/lib/utils/constants";
import { Eye, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";

export default function AppointmentsPage() {
  const { mutate } = useSWRConfig();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  // Detail sheet
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Assign rep dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRepId, setAssignRepId] = useState("");

  // Reschedule dialog
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");

  // Loading states
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useSwrPaginated("/api/appointments", { page, limit: 20, status: status || undefined, sort: "datetimeStart", order: "desc" });
  const appointments = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  // Fetch appointment detail
  const { data: detail } = useSwrFetch<any>(selectedId ? `/api/appointments/${selectedId}` : null);

  // Fetch team for assign
  const { data: teamData } = useSwrFetch<any>(assignOpen ? "/api/team?limit=50" : null);
  const teamMembers = (teamData as any)?.data || teamData || [];

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const openDetail = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const closeDetail = () => {
    setSheetOpen(false);
    setSelectedId(null);
  };

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/appointments"), undefined, { revalidate: true });
  }, [mutate]);

  const updateStatus = async (newStatus: string) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update status");
        return;
      }
      refreshData();
      mutate(`/api/appointments/${selectedId}`);
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRep = async () => {
    if (!selectedId || !assignRepId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedUserId: assignRepId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to assign rep");
        return;
      }
      refreshData();
      mutate(`/api/appointments/${selectedId}`);
      setAssignOpen(false);
      setAssignRepId("");
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedId || !rescheduleDate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESCHEDULED", datetimeStart: new Date(rescheduleDate).toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to reschedule");
        return;
      }
      refreshData();
      mutate(`/api/appointments/${selectedId}`);
      setRescheduleOpen(false);
      setRescheduleDate("");
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Appointments</h2>
        <Select options={statusOptions} placeholder="All Statuses" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-48" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt: any) => (
                <TableRow key={appt._id} className="cursor-pointer hover:bg-charcoal/50" onClick={() => openDetail(appt._id)}>
                  <TableCell className="font-medium">{appt.customerName}</TableCell>
                  <TableCell className="text-mist">{SERVICE_TYPE_LABELS[appt.serviceType] || appt.serviceType}</TableCell>
                  <TableCell>{formatDateTime(appt.datetimeStart)}</TableCell>
                  <TableCell><StatusBadge status={appt.status} type="appointment" /></TableCell>
                  <TableCell className="text-xs text-mist">{appt.assignedUserId?.name || <span className="text-mist/50">Unassigned</span>}</TableCell>
                  <TableCell className="text-xs text-mist">{appt.customerEmail}<br/>{appt.customerPhone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(appt._id); }}>
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Appointment Detail Sheet */}
      <Sheet open={sheetOpen} onClose={closeDetail} title="Appointment Details">
        {detail ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Customer</h3>
              <div className="space-y-1">
                <p className="font-medium">{detail.customerName}</p>
                <p className="text-sm text-mist">{detail.customerEmail}</p>
                <p className="text-sm text-mist">{detail.customerPhone}</p>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-mist">Service</span>
                  <p>{SERVICE_TYPE_LABELS[detail.serviceType] || detail.serviceType}</p>
                </div>
                <div>
                  <span className="text-mist">Date</span>
                  <p>{formatDateTime(detail.datetimeStart)}</p>
                </div>
                <div>
                  <span className="text-mist">Status</span>
                  <div className="mt-1"><StatusBadge status={detail.status} type="appointment" /></div>
                </div>
                <div>
                  <span className="text-mist">Assigned Rep</span>
                  <p>{detail.assignedUserId?.name || "Unassigned"}</p>
                </div>
              </div>
              {detail.notes && (
                <div>
                  <span className="text-mist text-sm">Notes</span>
                  <p className="text-sm mt-1">{detail.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {detail.status === "PENDING" && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={() => updateStatus("CONFIRMED")}
                  >
                    <CheckCircle size={14} className="mr-1" /> Confirm
                  </Button>
                )}
                {(detail.status === "PENDING" || detail.status === "CONFIRMED") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={actionLoading}
                      onClick={() => setRescheduleOpen(true)}
                    >
                      <Clock size={14} className="mr-1" /> Reschedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading}
                      onClick={() => updateStatus("CANCELLED")}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XCircle size={14} className="mr-1" /> Cancel
                    </Button>
                  </>
                )}
                {(detail.status === "CONFIRMED") && (
                  <Button
                    variant="gold"
                    size="sm"
                    loading={actionLoading}
                    onClick={() => updateStatus("COMPLETED")}
                  >
                    <CheckCircle size={14} className="mr-1" /> Mark Completed
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setAssignRepId(detail.assignedUserId?._id || ""); setAssignOpen(true); }}
                >
                  <UserPlus size={14} className="mr-1" /> Assign Rep
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20" />
          </div>
        )}
      </Sheet>

      {/* Assign Rep Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Representative">
        <div className="space-y-4">
          <Select
            label="Select Rep"
            options={
              Array.isArray(teamMembers)
                ? teamMembers.filter((m: any) => m.active !== false).map((m: any) => ({ value: m._id, label: `${m.name} (${m.role})` }))
                : []
            }
            placeholder="Choose a team member..."
            value={assignRepId}
            onChange={(e) => setAssignRepId(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleAssignRep} disabled={!assignRepId}>
              Assign
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule Appointment">
        <div className="space-y-4">
          <Input
            label="New Date & Time"
            type="datetime-local"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleReschedule} disabled={!rescheduleDate}>
              Reschedule
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
