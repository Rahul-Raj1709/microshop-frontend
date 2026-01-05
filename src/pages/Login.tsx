import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
import { Store, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    const destination = user.role === "Customer" ? "/" : "/dashboard";
    return <Navigate to={destination} replace />;
  }

  // Helper to decode token for immediate redirection logic
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // We read the token directly here because React State updates (user) are asynchronous
      // and might not be ready immediately for this logic.
      const token = localStorage.getItem("token");
      if (token) {
        const claims = parseJwt(token);
        // Your Backend AuthAPI returns a claim named "role"
        const role = claims?.role;
        navigate(role === "Customer" ? "/" : "/dashboard");
      } else {
        // Fallback safety
        navigate("/");
      }
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">MicroShop</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@microshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
              <p className="text-center text-xs font-medium text-muted-foreground">
                Demo Accounts
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-background p-2">
                  <span className="font-medium">Super Admin</span>
                  <code className="text-muted-foreground">
                    superadmin@example.com
                  </code>
                </div>
                <div className="flex items-center justify-between rounded-md bg-background p-2">
                  <span className="font-medium">Admin</span>
                  <code className="text-muted-foreground">
                    admin1@example.com
                  </code>
                </div>
                <div className="flex items-center justify-between rounded-md bg-background p-2">
                  <span className="font-medium">Customer</span>
                  <code className="text-muted-foreground">
                    user1@example.com
                  </code>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Use any password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
