import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("SuperAdmin" | "Admin" | "Customer")[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    title: "Manage Admins",
    href: "/super-admin",
    icon: Shield,
    roles: ["SuperAdmin"],
  },
  { title: "Users", href: "/admin/users", icon: Users, roles: ["SuperAdmin"] },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SuperAdmin", "Admin"],
  },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-sidebar-accent-foreground">
                MicroShop
              </span>
            </div>
          )}
          {collapsed && <Store className="mx-auto h-6 w-6 text-primary" />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}>
                      <Icon className="h-5 w-5" />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && user && (
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              {/* UPDATED: Shows Name instead of Username */}
              <p className="text-sm font-medium text-sidebar-accent-foreground">
                {user.name || user.username}
              </p>
              <p className="text-xs text-sidebar-foreground">{user.role}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-10 w-10 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                Logout
              </TooltipContent>
            </Tooltip>

            {!collapsed && <div className="flex-1" />}

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent">
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}
