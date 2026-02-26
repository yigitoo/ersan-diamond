"use client";

import { useSwrFetch } from "@/lib/hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, UserCircle } from "lucide-react";

export default function TeamPage() {
  const { data, isLoading } = useSwrFetch<any[]>("/api/team?limit=50");

  const users = data || [];
  const roleColors: Record<string, string> = {
    OWNER: "bg-brand-gold/20 text-brand-gold",
    ADMIN: "bg-purple-500/20 text-purple-400",
    SALES: "bg-blue-500/20 text-blue-400",
    VIEWER: "bg-slate text-mist",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Team</h2>
        <Button variant="primary" size="sm"><Plus size={16} className="mr-1" /> Add Member</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-xs text-mist">{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || ""}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user.active ? <span className="text-green-400 text-xs">Active</span> : <span className="text-red-400 text-xs">Inactive</span>}</TableCell>
                <TableCell className="text-xs text-mist">{user.signatureName || "-"}</TableCell>
                <TableCell className="text-xs text-mist">{user.phoneInternal || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
