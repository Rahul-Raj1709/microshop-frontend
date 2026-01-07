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
  Lock,
  Globe,
  Truck,
  DollarSign,
  Download,
  Trash2,
  Users,
  CreditCard,
  Code,
  Key,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/lib/clientId";

export default function Settings() {
  const { user, logout, getToken, API_URL } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- STATE MANAGEMENT ---

  // 1. Global User Data (Needed to preserve Name/Avatar when saving Admin Ops)
  const [fullProfile, setFullProfile] = useState<any>(null);

  // 2. Preferences (Mapped to Backend: UserPreferences)
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

  // 3. Security (Password - Mock for now as backend endpoint specific for this is pending)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // 4. Admin (Seller) Operations (Mapped to Backend: ProfileData.SellerOps)
  const [sellerOps, setSellerOps] = useState({
    autoAcceptOrders: true,
    currency: "USD",
    returnPolicy: "30-day standard",
  });

  // 5. SuperAdmin Platform (Mock/Local for now)
  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    commissionRate: 5,
  });

  // --- FETCH SETTINGS ON MOUNT ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            ClientId: getClientId(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFullProfile(data); // Store full object to preserve other fields

          // Map Preferences
          if (data.preferences) {
            setPreferences({
              theme: data.preferences.theme || "system",
              language: data.preferences.language || "en",
              twoFactorEnabled: data.preferences.twoFactorEnabled || false,
              notifications: {
                email: data.preferences.notifications?.email ?? true,
                push: data.preferences.notifications?.push ?? false,
                marketing: data.preferences.notifications?.marketing ?? true,
              },
            });
          }

          // Map Seller Ops (If Admin)
          if (data.role === "Admin" && data.profileData?.sellerOps) {
            setSellerOps({
              autoAcceptOrders:
                data.profileData.sellerOps.autoAcceptOrders ?? true,
              currency: data.profileData.sellerOps.currency || "USD",
              returnPolicy: "30-day standard", // Not in backend yet, keep default
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings", error);
        toast({
          title: "Error",
          description: "Could not load your settings.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) fetchSettings();
  }, [user, API_URL, getToken]);

  // --- HANDLERS ---

  // Save General & Notification Preferences
  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({ preferences }),
      });

      if (res.ok) {
        toast({
          title: "Preferences Saved",
          description: "Your settings have been updated.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save Admin Store Operations (Updates ProfileData)
  const handleSaveOperations = async () => {
    if (!fullProfile) return;
    setLoading(true);

    try {
      // We must send the FULL profile data structure back,
      // otherwise we might overwrite Address/Socials with just SellerOps.
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

      if (res.ok) {
        toast({
          title: "Operations Updated",
          description: "Store configuration saved.",
        });
        // Update local full profile state to reflect changes
        setFullProfile({ ...fullProfile, profileData: updatedProfileData });
      } else {
        throw new Error("Failed to save ops");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update operations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate API call (Backend endpoint for direct password change needs to be added)
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Password updated",
        description: "(Simulation) Password changed.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    }, 1000);
  };

  const isCustomer = user?.role === "Customer" || !user?.role;
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isAdmin = user?.role === "Admin";

  if (initialLoading) {
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

          {/* Customer Specific */}
          {isCustomer && (
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
              Payment Methods
            </TabsTrigger>
          )}

          {/* Seller Specific */}
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

          {/* SuperAdmin Specific */}
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

        {/* --- 1. General Tab (Everyone) --- */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Appearance & Language
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme Mode</Label>
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
              <Button onClick={handleSavePreferences} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
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
              <div className="space-y-1">
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  End your session on this device.
                </p>
              </div>
              <Button variant="destructive" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. Security Tab (Everyone) --- */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Account Security
              </CardTitle>
              <CardDescription>
                Manage your password and authentication methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="2fa" className="flex flex-col space-y-1">
                  <span className="font-medium">Two-Factor Authentication</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Add an extra layer of security to your account.
                  </span>
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

              {/* Password Change */}
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
                * 2FA setting is saved via "Save Preferences" below.
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSavePreferences}>
                  Save 2FA
                </Button>
                <Button onClick={handleChangePassword} disabled={loading}>
                  Update Password
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 3. Payment Methods (Customer Only) --- */}
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

        {/* --- 4. Operations Tab (Admin/Seller Only) --- */}
        {isAdmin && (
          <>
            <TabsContent value="operations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" /> Store Operations
                  </CardTitle>
                  <CardDescription>
                    Configure how you process orders and payments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label
                      htmlFor="auto-accept"
                      className="flex flex-col space-y-1">
                      <span>Auto-Accept Orders</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Automatically approve incoming orders if stock is
                        available.
                      </span>
                    </Label>
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
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={handleSaveOperations} disabled={loading}>
                    {loading ? "Saving..." : "Save Operations"}
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
          </>
        )}

        {/* --- 5. Platform Tab (SuperAdmin Only) --- */}
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

        {/* --- 6. Notifications Tab (Everyone) --- */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Email Preferences
              </CardTitle>
              <CardDescription>
                Manage what emails you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="orders" className="flex flex-col space-y-1">
                  <span>Order Updates</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive emails about your order status, shipping, and
                    delivery.
                  </span>
                </Label>
                <Switch
                  id="orders"
                  checked={preferences.notifications.email}
                  onCheckedChange={(c) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: c },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="promo" className="flex flex-col space-y-1">
                  <span>Marketing & Offers</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive emails about new products, sales, and events.
                  </span>
                </Label>
                <Switch
                  id="promo"
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
              <Button onClick={handleSavePreferences} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
