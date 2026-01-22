import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Store,
  ShoppingCart,
  User,
  LogOut,
  Sun,
  Moon,
  Package,
  Menu,
  Settings,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isManager = user?.role === "SuperAdmin" || user?.role === "Admin";

  // ... (NavLinks function remains the same) ...
  const NavLinks = () => (
    <>
      <Link
        to="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          location.pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}>
        Products
      </Link>
      {user && !isManager && (
        <>
          <Link
            to="/orders"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/orders"
                ? "text-primary"
                : "text-muted-foreground",
            )}>
            Orders
          </Link>
          <Link
            to="/cart"
            className={cn(
              "relative text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/cart"
                ? "text-primary"
                : "text-muted-foreground",
            )}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Link>
        </>
      )}
      {isManager && (
        <Link
          to="/dashboard"
          className="text-sm font-medium text-primary hover:text-primary/80">
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background transition-theme">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">MicroShop</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="h-9 w-9"
              aria-label="Toggle theme">
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* [!code ++] Wired up onClick */}
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {/* [!code ++] ADD WISHLIST HERE */}
                  {!isManager && (
                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      My Wishlist
                    </DropdownMenuItem>
                  )}
                  {/* [!code ++] Added Settings Item */}
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {!isManager && (
                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="mt-8 flex flex-col gap-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>

      {/* ... (Mobile Nav remains the same) ... */}
      {user && !isManager && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
          <div className="flex h-16 items-center justify-around">
            <Link
              to="/"
              className={cn(
                "flex flex-col items-center gap-1",
                location.pathname === "/" && "text-primary",
              )}>
              <Store className="h-5 w-5" />
              <span className="text-xs">Shop</span>
            </Link>
            <Link
              to="/orders"
              className={cn(
                "flex flex-col items-center gap-1",
                location.pathname === "/orders" && "text-primary",
              )}>
              <Package className="h-5 w-5" />
              <span className="text-xs">Orders</span>
            </Link>
            <Link
              to="/cart"
              aria-label="Shopping Cart" // [!code ++] Add this
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/cart"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}>
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Link>{" "}
            <Link
              to="/profile"
              className={cn(
                "flex flex-col items-center gap-1",
                location.pathname === "/profile" && "text-primary",
              )}>
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
