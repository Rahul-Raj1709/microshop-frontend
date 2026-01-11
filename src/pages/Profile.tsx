import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  MapPin,
  User,
  Mail,
  Phone,
  Save,
  Award,
  Camera,
  Plus,
  Trash2,
  Home,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define Address Type
type SavedAddress = {
  id: string;
  label: string;
  value: string;
};

export default function Profile() {
  const { user, getToken, API_URL } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local Form State ---
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });

  const [customerData, setCustomerData] = useState({
    shippingAddress: "",
    billingAddress: "",
    loyaltyPoints: 0,
    savedAddresses: [] as SavedAddress[],
  });

  const [businessData, setBusinessData] = useState({
    storeName: "",
    description: "",
    taxId: "",
    bankAccount: "",
    socials: { instagram: "", facebook: "" },
  });

  // UI State
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", value: "" });
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  // --- 1. Fetch Profile Data (Query) ---
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  // --- 2. Sync Query Data to Local State ---
  useEffect(() => {
    if (fetchedData) {
      setProfileData({
        name: fetchedData.name || "",
        email: fetchedData.email || "",
        phone: fetchedData.phoneNumber || "",
        avatarUrl: fetchedData.avatarUrl || "",
      });

      const pData = fetchedData.profileData || {};

      if (fetchedData.role === "Customer") {
        setCustomerData({
          shippingAddress: pData.shippingAddress || "",
          billingAddress: pData.billingAddress || "",
          loyaltyPoints: pData.loyaltyPoints || 0,
          savedAddresses: pData.savedAddresses || [],
        });
        if (
          pData.shippingAddress &&
          pData.shippingAddress === pData.billingAddress
        ) {
          setSameAsShipping(true);
        }
      } else if (fetchedData.role === "Admin") {
        setBusinessData({
          storeName: pData.storeName || "",
          description: pData.description || "",
          taxId: pData.taxId || "",
          bankAccount: pData.bankAccount || "",
          socials: {
            instagram: pData.socials?.instagram || "",
            facebook: pData.socials?.facebook || "",
          },
        });
      }
    }
  }, [fetchedData]);

  // Handle "Same as Shipping" Logic
  useEffect(() => {
    if (sameAsShipping) {
      setCustomerData((prev) => ({
        ...prev,
        billingAddress: prev.shippingAddress,
      }));
    }
  }, [customerData.shippingAddress, sameAsShipping]);

  // --- 3. Save Profile (Mutation) ---
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: profileData.name,
        phoneNumber: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        profileData: {},
      };

      if (user?.role === "Customer") {
        payload.profileData = { ...customerData };
      } else if (user?.role === "Admin") {
        payload.profileData = {
          ...businessData,
          socials: businessData.socials,
        };
      }

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");
      // Handle empty or text responses gracefully
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile Updated",
        description: "Changes saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // --- Handlers ---
  const handleAddAddress = () => {
    if (!newAddress.value) return;
    const addr: SavedAddress = {
      id: crypto.randomUUID(),
      label: newAddress.label || "Home",
      value: newAddress.value,
    };
    setCustomerData({
      ...customerData,
      savedAddresses: [...customerData.savedAddresses, addr],
    });
    setNewAddress({ label: "", value: "" });
    setIsAddingAddr(false);
  };

  const handleRemoveAddress = (id: string) => {
    setCustomerData({
      ...customerData,
      savedAddresses: customerData.savedAddresses.filter((a) => a.id !== id),
    });
  };

  const handleApplyAddress = (addrValue: string) => {
    setCustomerData((prev) => ({ ...prev, shippingAddress: addrValue }));
    if (sameAsShipping) {
      setCustomerData((prev) => ({ ...prev, billingAddress: addrValue }));
    }
    toast({ description: "Address applied to Shipping." });
  };

  const handleAvatarUpload = () => {
    const url = prompt("Enter Avatar URL:", profileData.avatarUrl);
    if (url) setProfileData({ ...profileData, avatarUrl: url });
  };

  if (isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your identity and public information.
          </p>
        </div>
        <Badge
          variant={user?.role === "SuperAdmin" ? "destructive" : "outline"}
          className="w-fit px-4 py-1 text-base capitalize">
          {user?.role || "Customer"} Account
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* LEFT COLUMN: Identity Card */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"></div>
            <CardContent className="-mt-16 flex flex-col items-center text-center">
              <div
                className="relative mb-4 group cursor-pointer"
                onClick={handleAvatarUpload}>
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={profileData.avatarUrl}
                    className="object-cover"
                  />
                  <AvatarFallback>{profileData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-sm text-muted-foreground">
                {profileData.email}
              </p>
              {user?.role === "Customer" && (
                <div className="mt-6 w-full grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">
                      {customerData.loyaltyPoints}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Award className="w-3 h-3" /> Points
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold mt-1">Gold</span>
                    <span className="text-xs text-muted-foreground">Tier</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div className="space-y-6">
          {/* 1. PERSONAL INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
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
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={profileData.email}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
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

          {/* 2. CUSTOMER: Address Manager */}
          {user?.role === "Customer" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Address Book
                  </CardTitle>
                  <CardDescription>
                    Manage saved addresses and defaults.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Saved Locations
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingAddr(!isAddingAddr)}
                      className="h-6 gap-1 text-primary">
                      <Plus className="h-3 w-3" /> Add New
                    </Button>
                  </div>

                  {isAddingAddr && (
                    <div className="flex gap-2 items-end border p-3 rounded-lg bg-muted/20">
                      <div className="grid gap-1 w-1/3">
                        <Label className="text-xs">Label</Label>
                        <Input
                          placeholder="Home"
                          value={newAddress.label}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              label: e.target.value,
                            })
                          }
                          className="h-8"
                        />
                      </div>
                      <div className="grid gap-1 w-full">
                        <Label className="text-xs">Address</Label>
                        <Input
                          placeholder="123 Street..."
                          value={newAddress.value}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              value: e.target.value,
                            })
                          }
                          className="h-8"
                        />
                      </div>
                      <Button size="sm" onClick={handleAddAddress}>
                        Save
                      </Button>
                    </div>
                  )}

                  {customerData.savedAddresses.length === 0 &&
                    !isAddingAddr && (
                      <p className="text-sm text-muted-foreground italic">
                        No saved addresses.
                      </p>
                    )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {customerData.savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start justify-between p-3 border rounded-lg bg-card hover:border-primary/50 transition-colors group">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleApplyAddress(addr.value)}>
                          <div className="flex items-center gap-2">
                            <Home className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {addr.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {addr.value}
                          </p>
                          <p className="text-[10px] text-primary mt-1 font-medium opacity-0 group-hover:opacity-100">
                            Click to apply
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveAddress(addr.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Default Shipping Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={(c) => setSameAsShipping(c === true)}
                      />
                      <Label
                        htmlFor="sameAsShipping"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Billing address same as shipping
                      </Label>
                    </div>

                    <div
                      className={
                        sameAsShipping ? "opacity-50 pointer-events-none" : ""
                      }>
                      <Label className="mb-2 block">Billing Address</Label>
                      <Input
                        value={
                          sameAsShipping
                            ? customerData.shippingAddress
                            : customerData.billingAddress
                        }
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            billingAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. ADMIN: Business Profile */}
          {user?.role === "Admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Store Name</Label>
                  <Input
                    value={businessData.storeName}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        storeName: e.target.value,
                      })
                    }
                  />
                </div>
                {/* Simplified for brevity - add other admin fields here */}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="gap-2 min-w-[140px]">
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
