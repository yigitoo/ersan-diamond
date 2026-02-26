"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative, formatPrice } from "@/lib/utils/formatters";
import { LEAD_STATUS_CONFIG } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { Eye, UserPlus, MessageSquare } from "lucide-react";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

export default function LeadsPage() {
  const { mutate } = useSWRConfig();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Detail sheet
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRepId, setAssignRepId] = useState("");

  // Notes edit
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useSwrPaginated("/api/leads", { page, limit: 20, status: status || undefined, search: search || undefined });
  const leads = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  // Fetch detail
  const { data: detail } = useSwrFetch<any>(selectedId ? `/api/leads/${selectedId}` : null);

  // Fetch team for assign
  const { data: teamData } = useSwrFetch<any>(assignOpen ? "/api/team?limit=50" : null);
  const teamMembers = (teamData as any)?.data || teamData || [];

  const statusOptions = [
    { value: "NEW", label: "New" },
    { value: "CONTACTED", label: "Contacted" },
    { value: "QUALIFIED", label: "Qualified" },
    { value: "PROPOSAL", label: "Proposal" },
    { value: "WON", label: "Won" },
    { value: "LOST", label: "Lost" },
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
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/leads"), undefined, { revalidate: true });
  }, [mutate]);

  const updateLead = async (payload: Record<string, unknown>) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/leads/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update lead");
        return;
      }
      refreshData();
      mutate(`/api/leads/${selectedId}`);
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRep = async () => {
    if (!assignRepId) return;
    await updateLead({ assignedUserId: assignRepId });
    setAssignOpen(false);
    setAssignRepId("");
  };

  const handleUpdateNotes = async () => {
    await updateLead({ notes: notesValue });
    setNotesOpen(false);
  };

  const moveToStatus = (newStatus: string) => updateLead({ status: newStatus });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-serif text-xl">Leads</h2>
        <div className="flex items-center gap-3">
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-48" />
          <Select options={statusOptions} placeholder="All Statuses" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: any) => (
                <TableRow key={lead._id} className="cursor-pointer hover:bg-charcoal/50" onClick={() => openDetail(lead._id)}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-mist text-xs">{lead.type}</TableCell>
                  <TableCell className="text-xs text-mist">{lead.email}<br/>{lead.phone}</TableCell>
                  <TableCell><StatusBadge status={lead.status} type="lead" /></TableCell>
                  <TableCell className="text-xs text-mist">{lead.assignedUserId?.name || <span className="text-mist/50">Unassigned</span>}</TableCell>
                  <TableCell className="text-xs text-mist">{lead.source}</TableCell>
                  <TableCell className="text-xs text-mist">{formatRelative(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(lead._id); }}>
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

      {/* Lead Detail Sheet */}
      <Sheet open={sheetOpen} onClose={closeDetail} title="Lead Details">
        {detail ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Contact</h3>
              <div className="space-y-1">
                <p className="font-medium">{detail.name}</p>
                {detail.email && <p className="text-sm text-mist">{detail.email}</p>}
                {detail.phone && <p className="text-sm text-mist">{detail.phone}</p>}
              </div>
            </div>

            {/* Lead Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Lead Info</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-mist">Type</span>
                  <p>{detail.type}</p>
                </div>
                <div>
                  <span className="text-mist">Source</span>
                  <p>{detail.source}</p>
                </div>
                <div>
                  <span className="text-mist">Status</span>
                  <div className="mt-1"><StatusBadge status={detail.status} type="lead" /></div>
                </div>
                <div>
                  <span className="text-mist">Assigned</span>
                  <p>{detail.assignedUserId?.name || "Unassigned"}</p>
                </div>
              </div>
            </div>

            {/* Product Info (Sell-to-us) */}
            {(detail.productBrand || detail.productModel) && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Product Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {detail.productBrand && <div><span className="text-mist">Brand</span><p>{detail.productBrand}</p></div>}
                  {detail.productModel && <div><span className="text-mist">Model</span><p>{detail.productModel}</p></div>}
                  {detail.productReference && <div><span className="text-mist">Reference</span><p>{detail.productReference}</p></div>}
                  {detail.productYear && <div><span className="text-mist">Year</span><p>{detail.productYear}</p></div>}
                  {detail.desiredPrice && <div><span className="text-mist">Desired Price</span><p>{formatPrice(detail.desiredPrice, detail.currency)}</p></div>}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Notes</h3>
                <Button variant="ghost" size="sm" onClick={() => { setNotesValue(detail.notes || ""); setNotesOpen(true); }}>
                  <MessageSquare size={12} className="mr-1" /> Edit
                </Button>
              </div>
              <p className="text-sm text-mist">{detail.notes || "No notes yet"}</p>
            </div>

            {/* Status Pipeline */}
            <div className="space-y-3 pt-4 border-t border-slate">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Pipeline</h3>
              <div className="flex gap-1 flex-wrap">
                {LEAD_STATUSES.map((s) => {
                  const config = LEAD_STATUS_CONFIG[s];
                  const isCurrent = detail.status === s;
                  return (
                    <button
                      key={s}
                      disabled={isCurrent || actionLoading}
                      onClick={() => moveToStatus(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        isCurrent
                          ? config.color + " ring-1 ring-brand-white/30"
                          : "bg-charcoal text-mist hover:text-brand-white hover:bg-slate",
                        "disabled:cursor-not-allowed"
                      )}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setAssignRepId(detail.assignedUserId?._id || ""); setAssignOpen(true); }}
              >
                <UserPlus size={14} className="mr-1" /> Assign Rep
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
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

      {/* Edit Notes Dialog */}
      <Dialog open={notesOpen} onClose={() => setNotesOpen(false)} title="Edit Notes">
        <div className="space-y-4">
          <Textarea
            label="Notes"
            rows={6}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add notes about this lead..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setNotesOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleUpdateNotes}>
              Save Notes
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
