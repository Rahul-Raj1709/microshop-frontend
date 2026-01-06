import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  MapPin,
  User,
  Mail,
  Phone,
  Save,
  Building2,
  CreditCard,
  Award,
  FileText,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, getToken, API_URL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Common Profile Data
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "+1 (555) 000-0000",
  });

  // Customer Specific Data
  const [customerData, setCustomerData] = useState({
    shippingAddress: "123 Micro Street, Tech City, TC 90210",
    billingAddress: "Same as shipping",
    loyaltyPoints: 1500,
    memberSince: "2024-01-15",
  });

  // Admin (Seller) Specific Data
  const [businessData, setBusinessData] = useState({
    storeName: "My Awesome MicroShop",
    description: "The best products in town.",
    taxId: "TAX-123456789",
    bankAccount: "**** **** **** 1234",
    bankName: "Tech Bank",
  });

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      // In a real app, fetch phone and role-specific details here
    }));
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Construct payload based on role
      const payload: any = { ...profileData };
      if (user?.role === "Customer") payload.customer = customerData;
      if (user?.role === "Admin") payload.business = businessData;

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        navigate("/too-many-requests");
        return;
      }

      if (res.ok) {
        toast({
          title: "Profile Updated",
          description: "Your information has been saved successfully.",
        });
      } else {
        // Fallback for demo
        setTimeout(() => {
          toast({
            title: "Profile Updated (Demo)",
            description: "Your local changes have been saved.",
          });
          setLoading(false);
        }, 800);
        return;
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your identity and public information.
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit px-4 py-1 text-base capitalize">
          {user?.role || "Customer"} Account
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* LEFT COLUMN: Identity Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>

              {user?.role === "Customer" && (
                <div className="mt-6 w-full grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">
                      {customerData.loyaltyPoints}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Award className="w-3 h-3" /> Points
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold mt-1">2 Years</span>
                    <span className="text-xs text-muted-foreground">
                      Member
                    </span>
                  </div>
                </div>
              )}

              {user?.role === "Admin" && (
                <div className="mt-6 w-full border-t pt-4">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Rating</span>
                      <span className="font-semibold text-foreground">
                        4.8/5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified</span>
                      <Badge variant="secondary" className="text-xs h-5">
                        Yes
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div className="space-y-6">
          {/* 1. PERSONAL INFO (All Roles) */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic identification details for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-9"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-9"
                      value={profileData.email}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. ROLE SPECIFIC SECTIONS */}

          {/* CUSTOMER: Addresses */}
          {user?.role === "Customer" && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
                <CardDescription>
                  Manage where you want your products delivered.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="s-address">Default Shipping Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="s-address"
                      className="pl-9"
                      value={customerData.shippingAddress}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          shippingAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-address">Billing Address</Label>
                  <Input
                    id="b-address"
                    value={customerData.billingAddress}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        billingAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ADMIN: Business Profile */}
          {user?.role === "Admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Information displayed to customers and used for invoicing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeName"
                      className="pl-9"
                      value={businessData.storeName}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          storeName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={businessData.description}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxId">Tax ID / GST</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="taxId"
                        className="pl-9"
                        value={businessData.taxId}
                        onChange={(e) =>
                          setBusinessData({
                            ...businessData,
                            taxId: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank">Bank Account (Masked)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bank"
                        className="pl-9"
                        value={businessData.bankAccount}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SUPERADMIN: Info */}
          {user?.role === "SuperAdmin" && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle>System Identity</CardTitle>
                <CardDescription>
                  Root access privileges for this account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Permissions:</span>
                    <ul className="list-disc pl-5 text-muted-foreground mt-1">
                      <li>User Management</li>
                      <li>Platform Configuration</li>
                      <li>Audit Logs Access</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold">Security Level:</span>
                    <div className="text-muted-foreground mt-1">
                      High (Tier 1)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SAVE ACTIONS */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="gap-2 w-full sm:w-auto">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
