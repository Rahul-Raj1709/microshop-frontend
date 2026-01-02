import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Admin {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

const initialAdmins: Admin[] = [
  { id: "1", username: "admin_john", email: "john@microshop.com", phoneNumber: "+1234567890", isActive: true, createdAt: "2024-01-15" },
  { id: "2", username: "admin_jane", email: "jane@microshop.com", phoneNumber: "+0987654321", isActive: true, createdAt: "2024-02-20" },
  { id: "3", username: "admin_bob", email: "bob@microshop.com", phoneNumber: "+1122334455", isActive: false, createdAt: "2024-03-10" },
];

export default function SuperAdmin() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const filteredAdmins = admins.filter(
    (a) =>
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const newAdmin: Admin = {
      id: Date.now().toString(),
      username: form.username,
      email: form.email,
      phoneNumber: form.phoneNumber,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins([...admins, newAdmin]);
    setDialogOpen(false);
    setForm({ username: "", email: "", password: "", phoneNumber: "" });
    toast({ title: "Admin created", description: `${newAdmin.username} has been added.` });
  };

  const handleDelete = (admin: Admin) => {
    if (confirm(`Delete admin "${admin.username}"? This action cannot be undone.`)) {
      setAdmins(admins.filter((a) => a.id !== admin.id));
      toast({ title: "Admin deleted", description: `${admin.username} has been removed.`, variant: "destructive" });
    }
  };

  const toggleStatus = (admin: Admin) => {
    setAdmins(
      admins.map((a) =>
        a.id === admin.id ? { ...a, isActive: !a.isActive } : a
      )
    );
    toast({
      title: admin.isActive ? "Admin deactivated" : "Admin activated",
      description: `${admin.username} is now ${admin.isActive ? "inactive" : "active"}.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">👑 Manage Admins</h1>
          <p className="text-muted-foreground">Create and manage administrator accounts.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Admin
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={[
          { header: "ID", accessorKey: "id", className: "font-mono text-sm w-20" },
          { header: "Username", accessorKey: "username", className: "font-medium" },
          { header: "Email", accessorKey: "email" },
          { header: "Phone", accessorKey: "phoneNumber" },
          {
            header: "Status",
            accessorKey: (row) => (
              <Badge variant={row.isActive ? "default" : "outline"}>
                {row.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
            className: "text-center",
          },
          {
            header: "Actions",
            accessorKey: (row) => (
              <div className="flex justify-end gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleStatus(row)}
                  title={row.isActive ? "Deactivate" : "Activate"}
                >
                  {row.isActive ? (
                    <UserX className="h-4 w-4 text-warning" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-success" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
            className: "text-right w-24",
          },
        ]}
        data={filteredAdmins}
        emptyMessage="No admins found."
      />

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin_username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
