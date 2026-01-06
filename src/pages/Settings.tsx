import { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/lib/clientId";

export default function Settings() {
  const { user, logout, getToken, API_URL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- STATE MANAGEMENT ---

  // Security
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [twoFactor, setTwoFactor] = useState(false);

  // Preferences (Common)
  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    notifications: {
      email: true,
      push: false,
      marketing: true,
    },
  });

  // Admin (Seller) Operations
  const [sellerOps, setSellerOps] = useState({
    autoAcceptOrders: true,
    currency: "USD",
    returnPolicy: "30-day standard",
  });

  // SuperAdmin Platform
  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    commissionRate: 5,
  });

  // --- HANDLERS ---

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Password updated successfully" });
      setPasswords({ current: "", new: "", confirm: "" });
    }, 1000);
  };

  const handleSaveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
    }, 800);
  };

  const isCustomer = user?.role === "Customer" || !user?.role;
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isAdmin = user?.role === "Admin";

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
              value="privacy"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
              Privacy
            </TabsTrigger>
          )}

          {/* Seller Specific */}
          {isAdmin && (
            <TabsTrigger
              value="operations"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
              Operations
            </TabsTrigger>
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
                  <Switch id="theme-mode" />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select defaultValue={preferences.language}>
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
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <LogOut className="h-5 w-5" /> Session
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device.
              </p>
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
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
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
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 3. Privacy Tab (Customer Only) --- */}
        {isCustomer && (
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Data & Privacy
                </CardTitle>
                <CardDescription>
                  Control your data usage and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Download My Data</p>
                    <p className="text-sm text-muted-foreground">
                      Get a copy of your order history and profile info.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">
                      Delete Account
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove your account and all data.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* --- 4. Operations Tab (Admin/Seller Only) --- */}
        {isAdmin && (
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
                    defaultValue={sellerOps.currency}
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
                <Button onClick={handleSaveSettings}>
                  Save Platform Config
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/super-admin")}>
                  Go to User Dashboard
                </Button>
              </CardContent>
            </Card>
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
                <Switch id="orders" defaultChecked />
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
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
