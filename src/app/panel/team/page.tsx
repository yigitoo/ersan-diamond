"use client";

import { useState } from "react";
import { useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface TeamUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  signatureName?: string;
  signatureTitle?: string;
  phoneInternal?: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "SALES", label: "Sales" },
  { value: "VIEWER", label: "Viewer" },
];

export default function TeamPage() {
  const { data, isLoading } = useSwrFetch<TeamUser[]>("/api/team?limit=50");
  const { mutate } = useSWRConfig();
  const { data: session } = useSession();
  const { t } = useI18n();

  const currentUserRole = (session?.user as any)?.role;
  const isOwner = currentUserRole === "OWNER";

  const users = data || [];

  const roleColors: Record<string, string> = {
    OWNER: "bg-brand-gold/20 text-brand-gold",
    ADMIN: "bg-purple-500/20 text-purple-400",
    SALES: "bg-blue-500/20 text-blue-400",
    VIEWER: "bg-slate text-mist",
  };

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("SALES");
  const [formPhone, setFormPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const refreshTeam = () => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/team"));
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("SALES");
    setFormPhone("");
    setFormError("");
  };

  // -- Add Member --
  const openAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const handleAdd = async () => {
    setFormError("");
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError(t("Ad, e-posta ve şifre zorunludur", "Name, email and password are required"));
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
          phoneInternal: formPhone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || t("Bir hata oluştu", "An error occurred"));
        return;
      }
      setAddOpen(false);
      refreshTeam();
    } catch {
      setFormError(t("Bir hata oluştu", "An error occurred"));
    } finally {
      setFormLoading(false);
    }
  };

  // -- Edit Member --
  const openEdit = (user: TeamUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormPhone(user.phoneInternal || "");
    setFormError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setFormError("");
    if (!formName.trim()) {
      setFormError(t("Ad zorunludur", "Name is required"));
      return;
    }
    setFormLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        phoneInternal: formPhone.trim(),
      };
      if (formPassword.trim()) {
        body.password = formPassword;
      }
      const res = await fetch(`/api/team/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || t("Bir hata oluştu", "An error occurred"));
        return;
      }
      setEditOpen(false);
      refreshTeam();
    } catch {
      setFormError(t("Bir hata oluştu", "An error occurred"));
    } finally {
      setFormLoading(false);
    }
  };

  // -- Delete Member --
  const openDelete = (user: TeamUser) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/team/${selectedUser._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || t("Bir hata oluştu", "An error occurred"));
        return;
      }
      setDeleteOpen(false);
      refreshTeam();
    } catch {
      setFormError(t("Bir hata oluştu", "An error occurred"));
    } finally {
      setFormLoading(false);
    }
  };

  // -- Toggle Active --
  const handleToggleActive = async (user: TeamUser) => {
    setToggleLoading(user._id);
    try {
      const res = await fetch(`/api/team/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const json = await res.json();
      if (json.success) {
        refreshTeam();
      }
    } catch {
      // Silently fail
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Ekip", "Team")}</h2>
        {isOwner && (
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus size={16} className="mr-1" /> {t("Üye Ekle", "Add Member")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Ad Soyad", "Name")}</TableHead>
              <TableHead>{t("E-posta", "Email")}</TableHead>
              <TableHead>{t("Rol", "Role")}</TableHead>
              <TableHead>{t("Durum", "Status")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("İmza", "Signature")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("Telefon", "Phone")}</TableHead>
              {isOwner && <TableHead className="text-right">{t("İşlemler", "Actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: TeamUser) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-xs text-mist">{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || ""}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {user.active
                    ? <span className="text-green-400 text-xs">{t("Aktif", "Active")}</span>
                    : <span className="text-red-400 text-xs">{t("Pasif", "Inactive")}</span>}
                </TableCell>
                <TableCell className="text-xs text-mist hidden md:table-cell">{user.signatureName || "-"}</TableCell>
                <TableCell className="text-xs text-mist hidden md:table-cell">{user.phoneInternal || "-"}</TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    {user.role !== "OWNER" && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-mist hover:text-brand-white transition-colors"
                          title={t("Düzenle", "Edit")}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={toggleLoading === user._id}
                          className="p-1.5 text-mist hover:text-brand-white transition-colors disabled:opacity-50"
                          title={user.active ? t("Pasife Al", "Deactivate") : t("Aktife Al", "Activate")}
                        >
                          {user.active
                            ? <ToggleRight size={14} className="text-green-400" />
                            : <ToggleLeft size={14} className="text-red-400" />}
                        </button>
                        <button
                          onClick={() => openDelete(user)}
                          className="p-1.5 text-mist hover:text-red-400 transition-colors"
                          title={t("Sil", "Delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title={t("Üye Ekle", "Add Member")}>
        <div className="space-y-4">
          <Input
            label={t("Ad Soyad", "Full Name")}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={t("Ad Soyad", "Full Name")}
          />
          <Input
            label={t("E-posta", "Email")}
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label={t("Şifre", "Password")}
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder={t("En az 8 karakter", "At least 8 characters")}
          />
          <Select
            label={t("Rol", "Role")}
            options={ROLE_OPTIONS}
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
          />
          <Input
            label={t("Telefon (Opsiyonel)", "Phone (Optional)")}
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder={t("Dahili numara", "Internal number")}
          />
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              {t("İptal", "Cancel")}
            </Button>
            <Button variant="primary" size="sm" loading={formLoading} onClick={handleAdd}>
              {t("Ekle", "Add")}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title={t("Üyeyi Düzenle", "Edit Member")}>
        <div className="space-y-4">
          <Input
            label={t("Ad Soyad", "Full Name")}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={t("Ad Soyad", "Full Name")}
          />
          <Input
            label={t("E-posta", "Email")}
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label={t("Şifre (Opsiyonel)", "Password (Optional)")}
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder={t("Boş bırakılırsa değişmez", "Leave blank to keep current")}
          />
          <Select
            label={t("Rol", "Role")}
            options={ROLE_OPTIONS}
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
          />
          <Input
            label={t("Telefon (Opsiyonel)", "Phone (Optional)")}
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder={t("Dahili numara", "Internal number")}
          />
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>
              {t("İptal", "Cancel")}
            </Button>
            <Button variant="primary" size="sm" loading={formLoading} onClick={handleEdit}>
              {t("Kaydet", "Save")}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("Üyeyi Sil", "Delete Member")}>
        <div className="space-y-4">
          <p className="text-mist text-sm">
            {t(
              "Bu üyeyi silmek istediğinize emin misiniz?",
              "Are you sure you want to delete this member?"
            )}
          </p>
          {selectedUser && (
            <p className="text-brand-white font-medium">{selectedUser.name} ({selectedUser.email})</p>
          )}
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              {t("İptal", "Cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={formLoading}
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {t("Sil", "Delete")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
