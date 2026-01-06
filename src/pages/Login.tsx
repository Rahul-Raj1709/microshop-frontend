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
import { Store, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getClientId } from "@/lib/clientId"; // [!code ++]

type ViewState = "login" | "register" | "forgot" | "verify";

export default function Login() {
  const [view, setView] = useState<ViewState>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, API_URL } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const destination = user.role === "Customer" ? "/" : "/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Context login function already has ClientId (from previous step)
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast({ title: "Welcome back!" });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: getClientId(), // [!code ++]
        },
        body: JSON.stringify({ name, username, email, phoneNumber: phone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Registration Successful",
          description: `OTP sent: ${data.mockOtp}`,
        });
        setView("verify");
      } else {
        toast({
          title: "Error",
          description: data || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: getClientId(), // [!code ++]
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "OTP Sent",
          description: `Check your email. Mock OTP: ${data.mockOtp}`,
        });
        setView("verify");
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Request failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: getClientId(), // [!code ++]
        },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Password set! Please login." });
        setView("login");
        setPassword("");
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP or Email",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Verification failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Render Helpers remain the same) ...
  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => setView("forgot")}>
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Sign In"
        )}
      </Button>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          className="underline"
          onClick={() => setView("register")}>
          Sign up
        </button>
      </div>
    </form>
  );

  const renderRegister = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Sign Up"
        )}
      </Button>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          className="underline"
          onClick={() => setView("login")}>
          Sign in
        </button>
      </div>
    </form>
  );

  const renderForgot = () => (
    <form onSubmit={handleForgot} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Enter your email</Label>
        <Input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Send OTP"
        )}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setView("login")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
      </Button>
    </form>
  );

  const renderVerify = () => (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-md text-sm text-center mb-4">
        We sent a code to <strong>{email}</strong>.
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp">OTP Code</Label>
        <Input
          id="otp"
          placeholder="123456"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-pass">New Password</Label>
        <Input
          id="new-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Set Password & Activate"
        )}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setView("login")}>
        Cancel
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">MicroShop</h1>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {view === "login" && "Sign In"}
              {view === "register" && "Create Account"}
              {view === "forgot" && "Reset Password"}
              {view === "verify" && "Verify Email"}
            </CardTitle>
            <CardDescription>
              {view === "login" &&
                "Enter your credentials to access the dashboard"}
              {view === "register" && "Enter your details to get started"}
              {view === "forgot" &&
                "We will send you a code to reset your password"}
              {view === "verify" && "Enter the OTP code and your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "login" && renderLogin()}
            {view === "register" && renderRegister()}
            {view === "forgot" && renderForgot()}
            {view === "verify" && renderVerify()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
