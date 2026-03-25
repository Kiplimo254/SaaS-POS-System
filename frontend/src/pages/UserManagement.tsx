import { useState, useEffect } from "react";
import { UserPlus, Users, Mail, Shield, Store, MoreVertical, ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "CASHIER",
    shop: "none",
  });
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    shop: "",
    is_active: true,
  });

  const isSuperAdmin = currentUser?.profile?.role === UserRole.SUPER_ADMIN;

  const fetchData = async () => {
    try {
      const [usersRes, shopsRes] = await Promise.all([
        api.get("users/"),
        isSuperAdmin ? api.get("shops/") : Promise.resolve({ data: [] })
      ]);
      setUsers(usersRes.data);
      if (isSuperAdmin) setShops(shopsRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData,
        shop: formData.shop === "none" ? null : (formData.shop || null)
      };
      if (!isSuperAdmin) {
        payload.shop = currentUser?.profile?.shop as any;
      }
      
      await api.post("users/", payload);
      toast.success("User created successfully");
      setIsAddDialogOpen(false);
      fetchData();
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "CASHIER",
        shop: "",
      });
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.profile?.role || "CASHIER",
      shop: user.profile?.shop?.toString() || "none",
      is_active: user.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !window.confirm(`Are you sure you want to delete ${selectedUser.username}?`)) return;
    
    try {
      await api.delete(`users/${selectedUser.id}/`);
      toast.success("User deleted successfully");
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: editFormData.email,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        is_active: editFormData.is_active,
        profile: {
          role: editFormData.role,
          shop: editFormData.shop === "none" ? null : (editFormData.shop || null),
        }
      };
      
      await api.patch(`users/${selectedUser.id}/`, payload);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Super Admin</Badge>;
      case 'ADMIN': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Admin</Badge>;
      case 'MANAGER': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Manager</Badge>;
      default: return <Badge variant="outline">Cashier</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {isSuperAdmin ? "Global User Management" : "Staff Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin ? "Manage users across all shops." : "Provision and manage checkout staff for your shop."}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="w-4 h-4" />
          {isSuperAdmin ? "Create System User" : "Add New Staff"}
        </Button>
      </div>

      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/40 bg-zinc-950/20">
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">User</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Shop</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Contacts</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{u.first_name} {u.last_name || u.username}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getRoleBadge(u.profile?.role)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Store size={14} className="opacity-50" />
                      <span className="font-medium">{u.profile?.shop_name || "Enterprise"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {u.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail size={12} className="opacity-40" />
                        <span className="truncate max-w-[150px]">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(u)}
                      className="h-8 w-8 hover:bg-primary/10 rounded-full"
                    >
                      <UserCog size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Create New {isSuperAdmin ? "System User" : "Staff Account"}</DialogTitle>
            <DialogDescription className="text-zinc-500">Add a new user to the system and assign their role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName" className="text-zinc-400">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-zinc-400">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-zinc-400">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-400">Initial Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-zinc-400">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    {isSuperAdmin && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
                    {isSuperAdmin && <SelectItem value="MANAGER">Manager</SelectItem>}
                    <SelectItem value="CASHIER">Cashier (Sales Person)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isSuperAdmin && (
                <div className="grid gap-2">
                  <Label className="text-zinc-400">Assign to Shop</Label>
                  <Select 
                    value={formData.shop} 
                    onValueChange={(v) => setFormData({ ...formData, shop: v })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectItem value="none">No Shop (Enterprise)</SelectItem>
                      {shops.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="pt-6">
              <Button type="submit" className="w-full pos-gradient-primary shadow-lg shadow-primary/20 text-white font-bold">
                Record User Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Modify Member Details</DialogTitle>
            <DialogDescription className="text-zinc-500">Update the user's information and access permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFirstName" className="text-zinc-400">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName" className="text-zinc-400">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editUsername" className="text-zinc-400">Username</Label>
                <Input
                  id="editUsername"
                  value={editFormData.username}
                  disabled
                  className="bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail" className="text-zinc-400">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-zinc-400">Member Status</Label>
                <Select 
                  value={editFormData.is_active ? "active" : "inactive"} 
                  onValueChange={(v) => setEditFormData({ ...editFormData, is_active: v === "active" })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="active">Active (Access Granted)</SelectItem>
                    <SelectItem value="inactive">Inactive (Revoked)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-400">Role</Label>
                <Select 
                  value={editFormData.role} 
                  onValueChange={(v) => setEditFormData({ ...editFormData, role: v })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    {isSuperAdmin && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
                    {isSuperAdmin && <SelectItem value="MANAGER">Manager</SelectItem>}
                    <SelectItem value="CASHIER">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="grid gap-2">
                <Label className="text-zinc-400">Assign to Shop</Label>
                <Select 
                  value={editFormData.shop} 
                  onValueChange={(v) => setEditFormData({ ...editFormData, shop: v })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="none">No Shop (Enterprise)</SelectItem>
                    {shops.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-2">
              {isSuperAdmin && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteUser}
                  className="sm:mr-auto"
                >
                  Terminate Access
                </Button>
              )}
              <Button type="submit" className="flex-1 pos-gradient-primary shadow-lg shadow-primary/20 text-white font-bold">
                Update Security Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
