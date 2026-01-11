import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  Bell,
  Palette,
  LogOut,
  Moon,
  Sun,
  Store,
  Server,
  CreditCard,
  Code,
  Key,
  Database,
  RefreshCw,
  Loader2,
  Truck,
  DollarSign,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/lib/clientId";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const { user, logout, getToken, API_URL } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local State for UI Binding ---
  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    twoFactorEnabled: false,
    notifications: {
      email: true,
      push: false,
      marketing: true,
    },
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [sellerOps, setSellerOps] = useState({
    autoAcceptOrders: true,
    currency: "USD",
  });

  // Mock platform config (local state only for now)
  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    commissionRate: 5,
  });

  // --- 1. Fetch Data (Query) ---
  const { data: fullProfile, isLoading } = useQuery({
    queryKey: ["profile", user?.id], // Sharing key with Profile.tsx to keep data in sync
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  // --- 2. Sync Data to Local State ---
  // We sync whenever new data arrives from the server
  useEffect(() => {
    if (fullProfile) {
      if (fullProfile.preferences) {
        setPreferences({
          theme: fullProfile.preferences.theme || "system",
          language: fullProfile.preferences.language || "en",
          twoFactorEnabled: fullProfile.preferences.twoFactorEnabled || false,
          notifications: {
            email: fullProfile.preferences.notifications?.email ?? true,
            push: fullProfile.preferences.notifications?.push ?? false,
            marketing: fullProfile.preferences.notifications?.marketing ?? true,
          },
        });
      }
      if (fullProfile.role === "Admin" && fullProfile.profileData?.sellerOps) {
        setSellerOps({
          autoAcceptOrders:
            fullProfile.profileData.sellerOps.autoAcceptOrders ?? true,
          currency: fullProfile.profileData.sellerOps.currency || "USD",
        });
      }
    }
  }, [fullProfile]);

  // --- 3. Save Preferences Mutation ---
  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({ preferences }),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    onSuccess: () => {
      toast({
        title: "Preferences Saved",
        description: "Your settings have been updated.",
      });
      // Invalidate profile query so other components (like Profile.tsx) get fresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  // --- 4. Save Seller Operations Mutation ---
  const saveOpsMutation = useMutation({
    mutationFn: async () => {
      if (!fullProfile) return;

      // Preserve existing profile data, only update sellerOps
      const updatedProfileData = {
        ...fullProfile.profileData,
        sellerOps: {
          ...fullProfile.profileData?.sellerOps,
          autoAcceptOrders: sellerOps.autoAcceptOrders,
          currency: sellerOps.currency,
        },
      };

      const payload = {
        name: fullProfile.name,
        phoneNumber: fullProfile.phoneNumber,
        avatarUrl: fullProfile.avatarUrl,
        profileData: updatedProfileData,
      };

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save ops");
    },
    onSuccess: () => {
      toast({
        title: "Operations Updated",
        description: "Store configuration saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  // --- Mock Password Change ---
  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    // Simulate API call
    toast({
      title: "Password updated",
      description: "(Simulation) Password changed.",
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const isCustomer = user?.role === "Customer" || !user?.role;
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isAdmin = user?.role === "Admin";

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground">
          Manage how your account behaves and protect your security.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 w-full justify-start border-b rounded-none bg-transparent p-0 mb-6">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
            General
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
            Security
          </TabsTrigger>
          {isCustomer && (
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
              Payment
            </TabsTrigger>
          )}
          {isAdmin && (
            <>
              <TabsTrigger
                value="operations"
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                Store Ops
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                Integrations
              </TabsTrigger>
            </>
          )}
          {isSuperAdmin && (
            <TabsTrigger
              value="platform"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
              Platform
            </TabsTrigger>
          )}
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* --- General Tab --- */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Appearance & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={preferences.theme}
                    onValueChange={(val) =>
                      setPreferences({ ...preferences, theme: val })
                    }>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(val) =>
                    setPreferences({ ...preferences, language: val })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button
                onClick={() => savePreferencesMutation.mutate()}
                disabled={savePreferencesMutation.isPending}>
                {savePreferencesMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <LogOut className="h-5 w-5" /> Session
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">End session.</p>
              </div>
              <Button variant="destructive" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Security Tab --- */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="2fa" className="flex flex-col space-y-1">
                  <span>Two-Factor Authentication</span>
                </Label>
                <Switch
                  id="2fa"
                  checked={preferences.twoFactorEnabled}
                  onCheckedChange={(c) =>
                    setPreferences({ ...preferences, twoFactorEnabled: c })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-between">
              <span className="text-xs text-muted-foreground self-center">
                * 2FA saved via "Save Preferences".
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => savePreferencesMutation.mutate()}>
                  Save 2FA
                </Button>
                <Button onClick={handleChangePassword}>Update Password</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Payment Methods (Customer Only) --- */}
        {isCustomer && (
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Saved Cards
                </CardTitle>
                <CardDescription>
                  Manage cards for faster checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-14 rounded bg-background border flex items-center justify-center">
                      <span className="font-bold text-xs">VISA</span>
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">
                        Expires 12/28
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive">
                    Remove
                  </Button>
                </div>
                <Button variant="outline" className="w-full border-dashed">
                  + Add New Card
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* --- Seller Ops Tab (Admin Only) --- */}
        {isAdmin && (
          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" /> Store Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="auto-accept">Auto-Accept Orders</Label>
                  <Switch
                    id="auto-accept"
                    checked={sellerOps.autoAcceptOrders}
                    onCheckedChange={(c) =>
                      setSellerOps({ ...sellerOps, autoAcceptOrders: c })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Default Currency</Label>
                  <Select
                    value={sellerOps.currency}
                    onValueChange={(c) =>
                      setSellerOps({ ...sellerOps, currency: c })
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  onClick={() => saveOpsMutation.mutate()}
                  disabled={saveOpsMutation.isPending}>
                  {saveOpsMutation.isPending ? "Saving..." : "Save Operations"}
                </Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Shipping Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage shipping zones and delivery partners.
                  </p>
                  <Button variant="outline" className="w-full">
                    Configure Shipping
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Payout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update bank details and payout schedule.
                  </p>
                  <Button variant="outline" className="w-full">
                    Manage Payouts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* --- Integrations Tab (Admin Only) --- */}
        {isAdmin && (
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" /> API Access
                </CardTitle>
                <CardDescription>
                  Manage API keys for external tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Production Key</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        pk_live_...x892
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Roll Key
                  </Button>
                </div>
                <Button className="w-full">Generate New Key</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* --- Platform Tab (SuperAdmin Only) --- */}
        {isSuperAdmin && (
          <TabsContent value="platform" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" /> Global Configuration
                </CardTitle>
                <CardDescription>
                  Control the entire MicroShop platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label
                    htmlFor="maintenance"
                    className="flex flex-col space-y-1">
                    <span>Maintenance Mode</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Disable access for all non-admin users.
                    </span>
                  </Label>
                  <Switch
                    id="maintenance"
                    checked={platformConfig.maintenanceMode}
                    onCheckedChange={(c) =>
                      setPlatformConfig({
                        ...platformConfig,
                        maintenanceMode: c,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label
                    htmlFor="registrations"
                    className="flex flex-col space-y-1">
                    <span>Allow New Registrations</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Let new users sign up for accounts.
                    </span>
                  </Label>
                  <Switch
                    id="registrations"
                    checked={platformConfig.allowRegistrations}
                    onCheckedChange={(c) =>
                      setPlatformConfig({
                        ...platformConfig,
                        allowRegistrations: c,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Platform Commission Rate (%)</Label>
                  <Input
                    type="number"
                    value={platformConfig.commissionRate}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        commissionRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  onClick={() =>
                    toast({
                      title: "Saved",
                      description: "Platform config updated.",
                    })
                  }>
                  Save Platform Config
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/super-admin")}>
                    Go to User Dashboard
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> System Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2">
                    <RefreshCw className="h-4 w-4" /> Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* --- Notifications Tab --- */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Order Updates</Label>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(c) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: c },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Marketing</Label>
                <Switch
                  checked={preferences.notifications.marketing}
                  onCheckedChange={(c) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        marketing: c,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button
                onClick={() => savePreferencesMutation.mutate()}
                disabled={savePreferencesMutation.isPending}>
                {savePreferencesMutation.isPending
                  ? "Saving..."
                  : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
