import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Loader2 } from "lucide-react";

export function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only Admin and SuperAdmin can access dashboard
  if (user.role === "Customer") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background transition-theme">
      <DashboardSidebar />
      <DashboardHeader sidebarCollapsed={sidebarCollapsed} />
      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "64px" : "256px" }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
