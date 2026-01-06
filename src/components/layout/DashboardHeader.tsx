import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Settings,
  LogOut,
  User,
  Loader2,
  Package,
  X,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean;
}

interface SearchResult {
  id: number;
  name: string;
  category: string;
  price: number;
}

export function DashboardHeader({
  sidebarCollapsed = false,
}: DashboardHeaderProps) {
  const { user, logout, API_URL, getToken } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  // --- Search State ---
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Notifications Mock ---
  const [notifications] = useState([
    { id: 1, title: "New order received", time: "2 min ago" },
    { id: 2, title: "Product stock low", time: "1 hour ago" },
    { id: 3, title: "System update available", time: "3 hours ago" },
  ]);

  const getInitials = (name: string) => {
    return (name || "User")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 1. Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // 2. Fetch Logic
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length === 0) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const token = getToken();
        const headers: any = {
          "Content-Type": "application/json",
          ClientId: getClientId(),
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(
          `${API_URL}/product/search?q=${encodeURIComponent(debouncedQuery)}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          // Handle both array (Elastic) and PagedList (DB) structures
          const items = Array.isArray(data) ? data : data.items || [];
          setResults(items);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery, API_URL, getToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (product: SearchResult) => {
    setShowResults(false);
    setQuery(""); // Clear search
    // Navigate to Admin Products page with filter (optional implementation) or just log
    // For now, we can navigate to the admin products page
    navigate("/admin/products");
  };

  return (
    <header
      className="glass-header fixed right-0 top-0 z-30 flex h-16 items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarCollapsed ? "64px" : "256px" }}>
      {/* Search Container */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="w-full bg-muted/50 pl-10 pr-10 focus:bg-background"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 0) setShowResults(true);
            }}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && query.length > 0 && (
          <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 overflow-hidden">
            {results.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto py-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Products
                </div>
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleResultClick(product)}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="truncate font-medium">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="h-5 px-1 py-0 text-[10px] font-normal">
                          {product.category || "General"}
                        </Badge>
                        <span>${product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {user ? getInitials(user.name || user.username) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.name || user?.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{user?.name || user?.username}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
